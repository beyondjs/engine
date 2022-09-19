const DynamicProcessor = global.utils.DynamicProcessor(Map);
const {crc32, equal} = global.utils;
const Package = require('./package');

/**
 * The packages dependencies are the dependencies configured in the package.json, plus the application libraries.
 * Only required in local environment to support dynamic imports, (as it is needed to know the version of the packages).
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.package_json.dependencies';
    }

    #application;

    #hash;
    get hash() {
        return this.#hash;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(application) {
        super();
        this.#application = application;
        super.setup(new Map([['package_json', {child: application.packagejson}]]));
    }

    #packages = new Map();
    #previous = [];

    _prepared(require) {
        const {valid, json} = this.children.get('package_json').child;
        if (!valid) {
            this.#errors = ['File package.json has reported errors'];
            this.#packages.forEach(pkg => pkg.destroy());
            return;
        }

        const updated = new Map();
        Object.keys(json.dependencies).forEach(dependency => {
            const pkg = this.#packages.has(dependency) ? this.#packages.get(dependency) :
                new Package(this.#application, dependency);

            updated.set(dependency, pkg);
        });

        // Clean up not required packages
        this.#packages.forEach(pkg => !updated.has(pkg) && pkg.destroy());

        this.#packages.clear();
        updated.forEach((pkg, name) => {
            require(pkg);
            this.#packages.set(name, pkg);
        });
    }

    _process() {
        const done = value => {
            const compute = {};
            value.forEach((version, pkg) => compute[pkg] = version);
            const hash = crc32(equal.generate(compute));
            if (this.#hash === hash) return false;

            this.#hash = hash;
            this.clear();
            value.forEach((version, pkg) => this.set(pkg, version));
            this.#previous = [...this];
            if (equal(value, this.#previous)) return false;
        }

        const value = new Map();
        this.#application.libraries.forEach(library => value.set(library.pkg, library.version));

        const {valid, json} = this.children.get('package_json').child;
        if (!valid) return done(value);

        Object.keys(json.dependencies).forEach(dependency =>
            value.set(dependency, this.#packages.get(dependency).version));
        return done(value);
    }
}
