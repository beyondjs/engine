const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    #sources;

    #files = new Map();
    get files() {
        return this.#files;
    }

    constructor(sources) {
        super();
        this.#sources = sources;
    }

    _prepared(require) {
        if (!require(this.#sources)) return false;
        this.#sources.files.forEach(file => require(file));
    }

    _process() {

    }
}
