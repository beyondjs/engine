const Resource = require('./resource');
const {ProcessorCodeCache} = require('beyond/stores');

module.exports = class {
    #cache;
    #loaded = false;

    #ims;
    get ims() {
        this.#process();
        return this.#ims;
    }

    #script;
    get script() {
        this.#process();
        return this.#script;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    /**
     * The pointer to the private method _generate that is located in the code class
     */
    #generate;
    #processed;

    #resource(item) {
        void this;
        if (typeof item !== 'object') throw new Error('Invalid "script" property received from code generation');
        const {code, map} = item;
        return new Resource({code, map});
    }

    #process() {
        if (this.#processed) return;
        const values = this.#generate();
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
    }

    get id() {
        return this.#code.id;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    constructor(code, generate, specs) {
        this.#code = code;
        this.#generate = generate;

        const {cache} = specs;
        cache && (this.#cache = new ProcessorCodeCache(this));
    }

    get ready() {
        return this.#code.preprocessor?.ready || this.#code.ready;
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
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
