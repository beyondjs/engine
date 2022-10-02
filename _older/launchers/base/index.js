module.exports = class {
    #path;
    get path() {
        return this.#path;
    }

    #config;
    get config() {
        return this.#config;
    }

    #error;
    get error() {
        return this.#error;
    }

    constructor(path, {config, error}) {
        this.#path = path;
        this.#config = config;
        this.#error = error;

        console.log('creating bee...', path, config);
    }

    destroy() {

    }
}
