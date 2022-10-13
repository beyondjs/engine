module.exports = class {
    #core;

    constructor(model) {
        this.#core = model.core;
    }

    wd() {
        return this.#core.path;
    }

    config() {
        return {
            errors: this.#core.errors,
            warnings: this.#core.warnings
        };
    }
}