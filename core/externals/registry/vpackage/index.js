module.exports = class {
    #json;
    get json() {
        return this.#json;
    }

    get name() {
        return this.#json.name;
    }

    get version() {
        return this.#json.version;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(json) {
        this.#json = json;
        this.#dependencies = new (require('./dependencies'))(json);
    }
}
