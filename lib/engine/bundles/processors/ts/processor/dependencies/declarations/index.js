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
        if (!dependencies.synchronized) return 'dependencies are not synchronized';

        dependencies.forEach(({declaration}) => require(declaration));
    }

    _process() {
        const dependencies = this.children.get('dependencies').child;

        // Check for errors in the dependencies
        this.#errors = [];
        dependencies.forEach(({specifier, valid, errors, declaration}) => {
            if (!valid) {
                this.#errors.push(`Dependency "${specifier}" is invalid: [${errors}]`);
            }
            if (!declaration.valid) {
                this.#errors.push(`Declaration of dependency "${specifier}" has been processed with errors: ` +
                    `[${declaration.errors}]`);
            }
        });

        this.clear();
        dependencies.forEach(({declaration}, specifier) => this.set(specifier, declaration));
    }

    destroy() {
        super.destroy();
        this.#hash.destroy();
    }
}
