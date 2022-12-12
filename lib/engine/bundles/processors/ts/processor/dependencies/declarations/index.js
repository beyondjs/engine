const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'ts.dependencies.declarations';
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

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

    get synchronized() {
        return this.#dependencies.synchronized;
    }

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;
        super.setup(new Map([['dependencies', {child: dependencies}]]));

        this.#hash = new (require('./hash'))(this);
    }

    _prepared(require) {
        const dependencies = this.#dependencies;
        const {distribution, language} = dependencies.processor;
        if (!dependencies.synchronized) return 'dependencies are not synchronized';

        const recursive = dependencies => dependencies.forEach(dependency => {
            if (!require(dependency)) return;
            const {bundle} = dependency;
            if (!bundle) return;

            const packager = bundle.packagers.get(distribution, language);
            packager.declaration && require(packager.declaration);

            if (!packager.dependencies || !require(packager.dependencies)) return;
            recursive(packager.dependencies);
        });

        recursive(dependencies);
    }

    _process() {
        const {distribution, language} = this.#dependencies.processor;

        // Check for errors in the dependencies
        this.#errors = [];
        const updated = new Map();
        const recursive = dependencies => dependencies.forEach(({specifier, valid, errors, bundle}) => {
            if (!valid) {
                this.#errors.push(`Dependency "${specifier}" is invalid: [${errors}]`);
                return;
            }
            if (!bundle) return;

            const packager = bundle.packagers.get(distribution, language);

            // Set the declaration
            (() => {
                if (!packager.declaration) return;

                const {valid, code, hash} = packager.declaration;
                valid ? updated.set(specifier, {code, hash}) :
                errors.push(`Declaration "${specifier}" processed with errors.`);
            })();

            packager.dependencies && recursive(packager.dependencies);
        });
        recursive(this.#dependencies);

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    }

    destroy() {
        super.destroy();
        this.#hash.destroy();
    }
}
