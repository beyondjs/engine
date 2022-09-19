module.exports = class {
    get is() {
        return 'application-module-identifier';
    }

    #developer;
    get developer() {
        return this.#developer;
    }

    #module;
    get module() {
        return this.#module;
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    constructor(developer, module, bundle) {
        this.#developer = developer;
        this.#module = module;
        this.#bundle = bundle;
    }
}