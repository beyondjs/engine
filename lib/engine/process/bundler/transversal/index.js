const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.transversal';
    }

    #application;
    get application() {
        return this.#application;
    }

    #name;
    get name() {
        return this.#name;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #multilanguage;
    get multilanguage() {
        return this.#multilanguage;
    }

    get id() {
        return `${this.#application.id}//${this.#name}`;
    }

    get pathname() {
        return this.#name;
    }

    #packagers = new Map();
    get packagers() {
        return this.#packagers;
    }

    /**
     * Transversal bundler constructor
     *
     * @param application {object} Can be an application module or an application library
     * @param name {string} The bundle's name
     * @param config {object} The transversals configuration set in the application.json
     */
    constructor(application, name, config) {
        if (!application || !name) throw new Error('Invalid parameters');
        if (!global.bundles.has(name) || !global.bundles.get(name).transversal) {
            throw new Error(`Bundle "${name}" is not registered`);
        }

        super();
        this.#application = application;
        this.#name = name;
        this.#packagers = new (require('./packagers'))(this);

        this.#multilanguage = !!global.bundles.get(name).multilanguage;

        super.setup(new Map([['config', {child: config}]]));
    }

    // Actually the transversals bundles are no requiring any configuration.
    // This could be used in future versions
    _process() {
        const config = this.children.get('config').child;
        void (config);
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
