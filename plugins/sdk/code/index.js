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

    get plugin() {
        return this.#conditional.plugin;
    }

    #config;
    get config() {
        return this.#config.value;
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
        return this.#preprocessor?.cancelled(request);
    }

    /**
     * Code constructor
     *
     * @param conditional {*}
     * @param specs {{cache: boolean, preprocessor: boolean}} Cache enabled or not
     */
    constructor(conditional, specs) {
        super();
        this.#conditional = conditional;
        this.#config = conditional.pexport.config;
        super.setup(new Map([['config', {child: this.#config}]]));

        specs = specs ? specs : {};
        const {cache} = specs;

        const update = async request => await this._update(request);
        this.#preprocessor = specs.preprocessor && new Preprocessor(this, update, {cache});

        const generate = () => this._generate();
        this.#outputs = new Outputs(this, generate, {cache});
    }

    async _begin() {
        await this.#conditional.ready;
        await this.#outputs.load();

        if (this.#outputs.updated) return;
        await this.#preprocessor?.load();
    }

    /**
     * Expected to be overridden
     * @return {number}
     */
    get hash() {
        return 0;
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
        !this.#preprocessor?.updated && this.#preprocessor?.invalidate();
        !this.#outputs.updated && this.#outputs.clear();

        return !this.#outputs.updated;
    }
}
