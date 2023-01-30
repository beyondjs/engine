const ItemBase = require('./base');
const DynamicProcessor = require('../../../dynamic-processor')(ItemBase);
const fs = require('fs').promises;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.finder-collection.item';
    }

    #collection;
    get collection() {
        return this.#collection;
    }

    /**
     * The version of the file
     * @type {{current: number, last: number, processing: number}}
     */
    #version = {current: 0, last: void 0, processing: void 0};
    get version() {
        return this.#version.last;
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

        this.#read();
    }

    #read() {
        if (this.#version.processing === this.#version.current) return;
        this.#version.processing = this.#version.current;

        const done = ({content, errors}) => {
            if (this.#version.processing !== this.#version.current) return;
            this.#version.last = this.#version.current;
            this.#version.processing = void 0;

            this.#errors = errors ? errors : [];
            this.#content.clean();
            content && (this.#content.value = content);

            this._invalidate();
        }

        fs.readFile(this.file, {encoding: 'utf8'}).then(content => {
            done({content});
        }).catch(exc => {
            console.log(exc.stack);
            done({errors: exc.message});
        })
    }

    _prepared() {
        if (this.#version.current !== this.#version.last) return false;
    }

    fileChanged() {
        this.#version.processing++;
        this.#read();
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
