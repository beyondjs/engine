const Reprocessor = require('beyond/utils/reprocessor');
const {ProcessorCodeCache} = require('beyond/stores');
const ScriptOutput = require('../code-outputs/script');
const NamespaceJS = require('../code-outputs/ns-js');
const NamespaceTypes = require('../code-outputs/ns-types');

module.exports = class extends Reprocessor {
    #code;
    /**
     * The pointer to the private method _build that is located in the code class
     */
    #build;

    #cache;
    #loaded = false;

    #ims;
    get ims() {
        return this.#ims;
    }

    #script;
    get script() {
        return this.#script;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    /**
     * Required by the cache to identify the record
     * @return {number}
     */
    get id() {
        return this.#code.id;
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

    constructor(code, build, specs) {
        super();
        this.#code = code;
        this.#build = build;

        const {cache} = specs;
        cache && (this.#cache = new ProcessorCodeCache(this));
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    async _process(request) {
        const values = await this.#build(request);
        if (this.cancelled(request)) return;

        /**
         * Check if build output is valid
         */
        (() => {
            const message = 'Invalid returned data from outputs generation';
            if (typeof values !== 'object') throw new Error(message);
            if (values.script && !(values.script instanceof ScriptOutput)) throw new Error(message);
            if (values.ims && !(values.ims instanceof Map)) throw new Error(message);
            values.ims?.forEach(im => {
                if (!(im instanceof NamespaceJS) && !(im instanceof NamespaceTypes)) throw new Error(message);
            })
        })();

        this.#script = values.script;

        this.#ims = new Map();
        values.ims?.forEach((im, key) => this.#ims.set(key, im));

        this.#hash = this.#code.hash;
    }

    clear() {
        this.#script = void 0;
        this.#ims?.delete();
    }

    hydrate(cached) {
        this.#script = cached.script;
        const ims = this.#ims = new Map(cached.ims);
        ims.forEach((im, key) => ims.set(key, im));
    }

    toJSON() {
        const script = this.#script;
        const ims = [...this.#ims];
        return {script, ims};
    }
}
