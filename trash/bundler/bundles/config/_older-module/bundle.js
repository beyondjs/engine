const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'module.bundle';
    }

    #name;
    #module;

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
     * @param module {object} The module object
     */
    constructor(name, module) {
        super();
        this.#name = name;
        this.#module = module;
    }

    _prepared() {
        return this.#configured;
    }

    _process() {
        const module = this.#module;
        const {input} = this.#config;

        const path = input.path ? require('path').join(module.path, input.path) : module.path;
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
