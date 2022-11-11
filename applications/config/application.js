module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #port;
    get port() {
        return this.#port;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #key;
    get key() {
        return this.#key;
    }

    constructor(config) {
        const {errors, warnings, value, valid} = config;

        this.#errors = errors.slice();
        this.#warnings = warnings.slice();
        if (!valid || !value) return;

        const {name, platform, port, dependencies} = value;
        this.#name = name;
        this.#platform = platform;
        this.#port = port;
        this.#dependencies = dependencies;
    }
}
