const Reprocessor = require('beyond/utils/reprocessor');
const {ProcessorCompilerCache} = require('beyond/stores');

module.exports = class extends Reprocessor {
    #compiler;
    /**
     * The pointer to the private method _compile that is located in the compiler class
     */
    #compile;

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

    get updated() {
        return this.#compiler.hash === this.#hash;
    }

    /**
     * Required by the cache to identify the record
     * @return {string}
     */
    get id() {
        return this.#compiler.id;
    }

    get ready() {
        return new Promise((resolve, reject) => {
            this.#compiler.ready
                .then(() => {
                    if (this.updated) return;
                    return super.ready;
                })
                .then(resolve)
                .catch(exc => reject(exc));
        });
    }

    constructor(compiler, compile, specs) {
        super();
        this.#compiler = compiler;
        this.#compile = compile;

        const {cache} = specs;
        cache && (this.#cache = new ProcessorCompilerCache(this));
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    async _process(request) {
        const processed = await this.#compile(request);
        if (this.cancelled(request)) return;

        this.#data = processed;
        this.#hash = this.#compiler.hash;
        this.#cache?.save();
    }

    clear() {
        this.#data = void 0;
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
