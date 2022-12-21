const ItemBase = require('./base');
const DynamicProcessor = require('../../../dynamic-processor')(ItemBase);
const fs = require('../../../fs');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.finder-collection.item';
    }

    #collection;
    get collection() {
        return this.#collection;
    }

    #version = 0;
    get version() {
        return this.#version;
    }

    #content = new (require('./content'))();
    get content() {
        return this.#content.value;
    }

    get hash() {
        return this.#content.hash;
    }

    get lines() {
        return this.#content.lines;
    }

    #errors = [];
    get errors() {
        return this.#errors.slice();
    }

    constructor(collection, file) {
        super(file);
        this.#collection = collection;
    }

    async _process(request) {
        this.#version++;
        this.#content.clean();
        this.#errors = [];

        try {
            const content = await fs.readFile(this.file, {encoding: 'utf8'});
            if (this._request !== request) return;
            this.#content.value = content;
        }
        catch (exc) {
            console.log(exc.stack);
            this.#errors.push(exc.message);
        }
    }

    fileChanged() {
        this._invalidate();
    }

    // This method should be overridden
    destroy() {
        this.removeALlListeners();
    }

    toJSON() {
        const json = {
            content: this.content,
            hash: this.hash,
            errors: this.errors
        };
        return Object.assign(json, super.toJSON());
    }
}
