const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {CodeCache} = require('beyond/stores');
const Processor = require('./processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'code';
    }

    #conditional;
    get conditional() {
        return this.#conditional;
    }

    #code;
    #map;
    #errors = [];
    #warnings = [];

    _outputs(hmr) {
        void hmr;
        throw new Error('This method must be overridden');
    }

    #outputs(hmr) {
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

    code(hmr) {
        if (!hmr && this.#code !== void 0) return this.#code;
        return this.#outputs(hmr).code;
    }

    map(hmr) {
        if (!hmr && this.#map !== void 0) return this.#map;
        return this.#outputs(hmr).map;
    }

    get errors() {
        return this.#errors;
    }

    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    #cache;
    #hash;
    get hash() {
        return this.#hash;
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    /**
     * It allows to the _update method to know if its execution has been cancelled or not
     * @param request
     * @return {boolean}
     */
    cancelled(request) {
        return this.#processor.cancelled(request);
    }

    /**
     * Code constructor
     *
     * @param conditional {*}
     * @param specs {{cache: boolean}} Cache enabled or not
     */
    constructor(conditional, specs) {
        super();
        this.#conditional = conditional;

        const {cache} = specs;
        cache && (this.#cache = new CodeCache(this));

        this.#processor = new Processor(
            async request => await this._update(request),
            response => this._processed(response)
        );
    }

    async _begin() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        await this.#conditional.ready;
    }

    /**
     * Expected to be overridden
     * @return {boolean}
     */
    get updated() {
        return true;
    }

    /**
     * This method can be overridden if implementation requires asynchronous processing previous to the
     * construction of the code or map properties
     *
     * @param request
     * @return {Promise<void>}
     * @private
     */
    async _update(request) {
        void request;
    }

    /**
     * This method can be overridden if implementation requires asynchronous processing previous to the
     * construction of the code or map properties
     *
     * @param response
     * @return {Promise<void>}
     * @private
     */
    _processed(response) {
        void response;
    }

    _process() {
        if (this.updated) return;
        this.#code = void 0;
        this.#map = void 0;
        this.#errors = [];
        this.#warnings = [];

        this.#processor.invalidate();
    }

    hydrate(cached) {
        const {hash, code, map, errors} = cached;
        this.#hash = hash;
        this.#code = code;
        this.#map = map;
        this.#errors = errors;
    }

    toJSON() {
        const hash = this.#hash;
        const code = this.#code;
        const map = this.#map;
        const errors = this.#errors;
        return {hash, code, map, errors}
    }
}
