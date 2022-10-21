const PackageBase = require('./base');

module.exports = class extends PackageBase {
    get is() {
        return 'internal';
    }

    #json;

    get vspecifier() {
        const {name, version} = this.#json;
        return `${name}@${version}`;
    }

    /**
     * External package constructor
     *
     * @param path {string} The path where the external package is located
     * @param json {*} The package.json content as an object
     */
    constructor(path, json) {
        super(path);
        this.#json = json;
    }

    _process() {
        super._process(this.#json);
    }
}
