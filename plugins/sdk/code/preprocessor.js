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
    #updated;

    get id() {
        return this.#code.id;
    }

    async process() {
        const processed = await this.#process();
        if (typeof processed !== 'object') throw new Error('Invalid update returned data');

        const {data, hash} = processed;
        this.#data = data;
        this.#hash = hash;
        this.#cache?.save();
    }

    constructor(code, process, updated, specs) {
        super();
        this.#code = code;
        this.#process = process;
        this.#updated = updated;

        const {cache} = specs;
        cache && (this.#cache = new PreprocessedCodeCache(this));
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    get ready() {
        return new Promise((resolve, reject) => {
            this.#code.ready
                .then(() => {
                    if (this.#updated()) return;
                    return super.ready;
                })
                .then(resolve)
                .catch(exc => reject(exc));
        });
    }

    get(resource, hmr) {
        const outputs = this._outputs(hmr);
        if (typeof outputs !== 'object') throw new Error('Invalid outputs');

        let {code, map, errors, warnings} = outputs;
        code = code ? code : '';
        map = map ? map : null;
        errors = errors ? errors : [];
        warnings = warnings ? warnings : [];

        if (hmr) return {code, map, errors, warnings};

        this.#code = code;
        this.#map = map;
        this.#errors = errors;
        this.#warnings = warnings;

        return {code, map, errors, warnings};
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
