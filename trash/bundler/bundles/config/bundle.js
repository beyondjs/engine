const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundles.config.bundle';
    }

    #name;
    #container;

    #path;
    get path() {
        return this.#path;
    }

    #configured = false;
    #config = {};

    get value() {
        return this.#config.processed;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    /**
     * Bundle configuration constructor
     *
     * @param name {string} The bundle's name
     * @param container {object} The container object
     */
    constructor(name, container) {
        if (!name || !container) throw new Error('Invalid parameters');
        super();

        this.#name = name;
        this.#container = container;
    }

    _prepared() {
        return this.#configured;
    }

    _process() {
        const container = this.#container;
        const {input} = this.#config;

        const path = input.path ? require('path').join(container.path, input.path) : container.path;
        delete input.path;

        if (this.#path === path && equal(input, this.#config.processed)) return;

        this.#errors = typeof input === 'object' ? [] : ['Bundle configuration should be an object'];
        this.#path = path;
        this.#config.processed = input;
    }

    configure(config) {
        this.#config.input = config;
        this.#configured = true;
        this._invalidate();
    }
}
