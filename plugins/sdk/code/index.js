const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Preprocessor = require('./preprocessor');
const Outputs = require('./outputs');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'code';
    }

    get resource() {
        throw new Error('This property must be overridden, ex: "js", "css", "types"');
    }

    #conditional;
    get conditional() {
        return this.#conditional;
    }

    get id() {
        return `${this.#conditional.id}//${this.resource}`;
    }

    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    #outputs;
    get outputs() {
        return this.#outputs;
    }

    /**
     * It allows to the _update method to know if its execution has been cancelled or not
     * @param request
     * @return {boolean}
     */
    cancelled(request) {
        return this.#preprocessor.cancelled(request);
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

        specs = specs ? specs : {};
        const {cache} = specs;

        const update = async request => await this._update(request);
        const updated = () => this.updated;
        this.#preprocessor = new Preprocessor(this, update, updated, {cache});

        const generate = () => this._generate();
        this.#outputs = new Outputs(generate);
    }

    async _begin() {
        await Promise.all([this.#conditional.ready, this.#preprocessor.load()]);
    }

    /**
     * Expected to be overridden
     * @return {boolean}
     */
    get updated() {
        return this.#preprocessor.loaded;
    }

    /**
     * This method can be overridden (optional) if implementation requires asynchronous processing
     * previous to the construction of the code or map properties
     *
     * @param request
     * @return {Promise<void>}
     * @private
     */
    async _update(request) {
        void request;
    }

    /**
     * This method should be overridden to generate the outputs
     *
     * @param hmr
     * @private
     */
    _generate(hmr) {
        throw new Error('This method should be overridden');
    }

    _process() {
        if (this.updated) return;
        this.#code = void 0;
        this.#map = void 0;
        this.#errors = [];
        this.#warnings = [];

        this.#preprocessor.invalidate();
    }
}
