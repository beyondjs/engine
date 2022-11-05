const Sources = require('./sources');

module.exports = class {
    #files;
    get files() {
        return this.#files;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    constructor(sources) {
        this.#files = new Sources(sources.files);
        // this.#extensions = new Sources(sources.extensions);
    }
}
