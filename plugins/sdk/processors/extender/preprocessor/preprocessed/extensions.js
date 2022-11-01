const Source = require('../../../source');

/**
 * The extensions of a preprocessed source
 */
module.exports = class {
    #processor;

    #source;
    get source() {
        return this.#source;
    }

    get hash() {
        return this.#source.hash;
    }

    #extensions = new Map();
    #available = new Set();

    constructor(processor, is, source) {
        this.#processor = processor;

        const {meta} = processor;
        const {extends: _extends} = meta.extender;
        _extends.forEach(processor => this.#available.add(processor));

        this.#source = source ? new Source(processor, source) : void 0;
    }

    get(processor) {
        return this.#extensions.get(processor);
    }

    set(values) {
        this.#extensions.clear();
        values?.forEach((data, processor) => {
            if (!this.#available.has(processor)) throw new Error(`Processor "${processor}" is not being extended`);
            this.#extensions.set(processor, data);
        });
    }

    hydrate(cached) {
        this.#source = new Source(this.#processor);
        this.#source.hydrate(cached.source);

        this.#extensions = new Map(cached.extensions);
    }

    toJSON() {
        return {source: this.#source.toJSON(), extensions: [...this.#extensions]};
    }
}
