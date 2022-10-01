const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'sass.dependencies.files';
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

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;
        super.setup(new Map([['dependencies', {child: dependencies}]]));

        this.#hash = new (require('./hash'))(this);
    }

    _prepared(require) {
        const dependencies = this.children.get('dependencies').child;
        dependencies.forEach(({files}) => files && require(files));
    }

    _process() {
        const dependencies = this.children.get('dependencies').child;

        // Check for errors in the dependencies
        const errors = [];
        dependencies.forEach(({resource, valid, errors}) =>
            !valid && errors.push(`Dependency "${resource}" is invalid: [${errors}]`));

        this.#errors = errors;
        this.clear();
        dependencies.forEach(({files}, resource) => files && this.set(resource, files));
    }

    destroy() {
        super.destroy();
        this.#hash.destroy();
    }
}
