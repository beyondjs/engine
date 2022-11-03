const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Preprocessor = require('./preprocessor');
const Outputs = require('./outputs');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'processor.code';
    }

    get resource() {
        throw new Error('This property must be overridden, ex: "js", "css", "types"');
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #id;
    get id() {
        return this.#id;
    }

    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    get data() {
        return this.#preprocessor?.data;
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
     * @param processor {*}
     * @param specs {{cache: boolean, preprocessor: boolean}} Cache enabled or not
     */
    constructor(processor, specs) {
        super();
        this.#processor = processor;
        this.#id = `${processor.id}//${this.resource}`;

        specs = specs ? specs : {};
        const {cache} = specs;

        const update = async request => await this._update(request);
        this.#preprocessor = specs.preprocessor && new Preprocessor(this, update);

        const generate = () => this._generate();
        this.#outputs = new Outputs(this, generate, {cache});
    }

    async _begin() {
        await this.#processor.ready;
        await this.#outputs.load();
    }

    /**
     * Expected to be overridden
     * @return {number}
     */
    get hash() {
        throw new Error('Property .hash must be overridden');
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
     * @private
     */
    _generate() {
        throw new Error('This method should be overridden');
    }

    _process() {
        !this.#preprocessor?.updated && this.#preprocessor?.invalidate();
        !this.#outputs.updated && this.#outputs.clear();

        return !this.#outputs.updated;
    }
}
