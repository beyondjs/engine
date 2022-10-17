const PackageBase = require('./base');

module.exports = class extends PackageBase {
    #packages;
    #json;

    /**
     * External package constructor
     *
     * @param path {string} The path where the external package is located
     * @param json {*} The package.json content as an object
     * @param packages {*} The packages collection
     */
    constructor(path, json, packages) {
        super(path);
        this.#json = json;
        this.#packages = packages;
    }

    _process() {
        super._process(this.#json);
    }
}
