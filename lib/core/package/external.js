module.exports = class extends require('./attributes') {
    #packages;
    #json;

    #modules;
    get modules() {
        return this.#modules;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    /**
     * External package constructor
     *
     * @param path {string} The path where the external package is located
     * @param json {*} The package.json content as an object
     * @param packages {*} The packages collection
     */
    constructor(path, packages, json) {
        super(path);
        this.#packages = packages;
        this.#json = json;
    }

    async _begin() {
        this.#_static = new (require('./static'))();
        this.#modules = new (require('./modules'))();
    }
}
