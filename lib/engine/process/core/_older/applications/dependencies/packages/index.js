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
        super.setup(new Map([
            ['package_json', {child: application.packagejson}],
            ['libraries', {child: application.libraries}]
        ]));
    }

    #packages = new Map();
    #previous = [];

    _prepared(require) {
        const {valid, json} = this.children.get('package_json').child;
        if (!valid) {
            this.#errors = ['File package.json has reported errors'];
            this.#packages.forEach(pkg => pkg.destroy());
            this.#packages.clear();
            return;
        }

        const {libraries} = this.#application;
        libraries.forEach(library => require(library));

        const updated = new Map();
        Object.keys(json.dependencies).forEach(dependency => {
            const pkg = this.#packages.has(dependency) ? this.#packages.get(dependency) :
                        new Package(this.#application, dependency);

            updated.set(dependency, pkg);
        });

        // Clean up not required packages
        this.#packages.forEach((pkg, dependency) => !updated.has(dependency) && pkg.destroy());

        this.#packages.clear();
        updated.forEach((pkg, name) => {
            require(pkg);
            this.#packages.set(name, pkg);
        });
    }

    _process() {
        const done = ({value, errors}) => {
            if (errors?.length && equal(errors, this.#errors)) return false;
            this.#errors = errors ? errors : [];
            if (!this.valid) {
                this.clear();
                return;
            }

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
        const errors = [];
        this.#application.libraries.forEach(library => value.set(library.pkg, library.version));

        const {valid, json} = this.children.get('package_json').child;
        if (!valid) return done({value});

        const packages = Object.keys(json.dependencies);
        packages.forEach(dependency => {
            const pkg = this.#packages.get(dependency);
            !pkg.valid && errors.push(pkg.error);
        });
        if (errors.length) return done({errors});

        packages.forEach(dependency => value.set(dependency, this.#packages.get(dependency).version));
        return done({value});
    }
}
