const Reprocessor = require('beyond/utils/reprocessor');
const {ProcessorCodeCache} = require('beyond/stores');
const Resource = require('./resource');

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

    #resource(item) {
        void this;
        if (typeof item !== 'object') throw new Error('Invalid "script" property received from code generation');
        const {code, map} = item;
        return new Resource({code, map});
    }

    async _process(request) {
        const values = await this.#build();
        if (this.cancelled(request)) return;

        if (typeof values !== 'object') throw new Error('Invalid returned data from outputs generation');

        this.#script = (() => {
            if (!values.script) return;
            const script = typeof values.script === 'string' ? {code: values.script} : values.script;
            return this.#resource(script);
        })();

        this.#ims = (() => {
            if (!values.ims) return;
            if (!(values instanceof Map)) throw new Error('Invalid "ims" property received from code generation');

            const ims = new Map();
            values.ims.forEach((im, key) => ims.set(key, this.#resource(im)));
            return ims;
        })();

        this.#hash = this.#code.hash;
    }

    clear() {
        this.#script = void 0;
        this.#ims?.delete();
    }

    hydrate(cached) {
        this.#script = cached.script;
        const ims = this.#ims = new Map(cached.ims);
        ims.forEach((im, key) => ims.set(key, this.#resource(im)));
    }

    toJSON() {
        const script = this.#script;
        const ims = [...this.#ims];
        return {script, ims};
    }
}
