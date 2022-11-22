const Reprocessor = require('beyond/utils/reprocessor');
const {ProcessorCodeCache} = require('beyond/stores');
const ScriptOutput = require('../code-outputs/script');
const StylesOutput = require('../code-outputs/styles');
const NamespaceJS = require('../code-outputs/ns-js');
const NamespaceTypes = require('../code-outputs/ns-types');
const Diagnostics = require('../../diagnostics/diagnostics');

module.exports = class extends Reprocessor {
    #code;
    /**
     * The pointer to the private method _build that is located in the code class
     */
    #build;

    #cache;
    #loaded = false;

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    #ims;
    get ims() {
        return this.#ims;
    }

    #script;
    get script() {
        return this.#script;
    }

    #styles;
    get styles() {
        return this.#styles;
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
            if (typeof values !== 'object') {
                throw new Error(message);
            }
            if (!values.diagnostics || !(values.diagnostics instanceof Diagnostics)) {
                throw new Error(`${message}: diagnostics is invalid or not set`);
            }
            if (values.script && !(values.script instanceof ScriptOutput)) {
                throw new Error(`${message}: Invalid script output`);
            }
            if (values.styles && !(values.styles instanceof StylesOutput)) {
                throw new Error(`${message}: Invalid styles output`);
            }
            if (values.ims && !(values.ims instanceof Map)) {
                throw new Error(`${message}: internal modules must be a Map object`);
            }
            values.ims?.forEach(im => {
                if (!(im instanceof NamespaceJS) && !(im instanceof NamespaceTypes)) {
                    throw new Error(`${message}: Invalid internal modules were found`);
                }
            });
        })();

        this.#diagnostics = values.diagnostics;
        this.#script = values.script;
        this.#styles = values.styles;
        this.#ims = values.ims;
        this.#hash = this.#code.hash;
    }

    clear() {
        this.#diagnostics = this.#script = this.#styles = void 0;
        this.#ims?.delete();
    }

    hydrate(cached) {
        this.#diagnostics = new Diagnostics(cached.diagnostics);
        this.#script = cached.script ? new ScriptOutput(cached.script) : void 0;
        this.#styles = cached.styles ? new StylesOutput(cached.styles) : void 0;

        const ims = this.#ims = new Map(cached.ims);
        ims.forEach((im, key) => {
            im = this.#code.resource === 'types' ? new NamespaceTypes(im) : new NamespaceJS(im);
            this.#ims.set(key, im);
        });
    }

    toJSON() {
        const {diagnostics, script, styles} = this;
        const ims = [...this.#ims];
        return {diagnostics, script, ims, styles};
    }
}
