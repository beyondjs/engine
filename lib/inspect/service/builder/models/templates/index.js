module.exports = class Templates {
    #path;
    #ready;
    static #instance;

    get ready() {
        return this.#ready;
    }

    get path() {
        return this.#path;
    }

    constructor(path) {
        if (path) {
            this.#ready = true;
            this.#path = path;
            return;
        }
        this.#getPath();
    }

    async #getPath() {
        this.#path = await this.ipc().main('templates');
        return this.#ready = true;

    }

    load() {
        return this.#getPath();
    }

    ipc() {
        return require('../../../ipc-manager');
    }

    static get(path) {
        if (!Templates.#instance) {
            Templates.#instance = new Templates(path);
        }
        return Templates.#instance;
    }
}