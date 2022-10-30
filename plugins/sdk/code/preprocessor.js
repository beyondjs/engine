const Reprocessor = require('beyond/utils/reprocessor');
const {PreprocessedCodeCache} = require('beyond/stores');

module.exports = class extends Reprocessor {
    #cache;
    #loaded = false;

    #data;
    get data() {
        return this.#data;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    #process;

    get id() {
        return this.#code.id;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    constructor(code, process, specs) {
        super();
        this.#code = code;
        this.#process = process;

        const {cache} = specs;
        cache && (this.#cache = new PreprocessedCodeCache(this));
    }

    get ready() {
        return new Promise((resolve, reject) => {
            this.#code.ready
                .then(() => {
                    if (this.updated) return;
                    return super.ready;
                })
                .then(resolve)
                .catch(exc => reject(exc));
        });
    }

    async process() {
        const processed = await this.#process();
        if (typeof processed !== 'object') throw new Error('Invalid update returned data');

        const {data, hash} = processed;
        this.#data = data;
        this.#hash = hash;
        this.#cache?.save();
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    hydrate(cached) {
        const {hash, data} = cached;
        this.#hash = hash;
        this.#data = data;
    }

    toJSON() {
        const hash = this.#hash;
        const data = this.#data;
        return {hash, data};
    }
}
