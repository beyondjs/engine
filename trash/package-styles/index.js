module.exports = class {
    #application;
    get application() {
        return this.#application;
    }

    #global;
    get global() {
        return this.#global;
    }

    constructor(application) {
        this.#application = new (require('./application'))(application);
        this.#global = new (require('./global'))(application);
    }

    destroy() {
        this.#application.destroy();
        this.#global.destroy();
    }
}
