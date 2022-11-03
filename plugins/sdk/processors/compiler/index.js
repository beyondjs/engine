const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Outputs = require('./outputs');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'processor.compiler';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #id;
    get id() {
        return this.#id;
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
        return this.#outputs?.cancelled(request);
    }

    /**
     * Compiler constructor
     *
     * @param processor {*}
     * @param specs {{cache: boolean}} Cache enabled or not
     */
    constructor(processor, specs) {
        super();
        this.#processor = processor;
        this.#id = processor.id;

        specs = specs ? specs : {};
        const {cache} = specs;

        const compile = async request => await this._compile(request);
        this.#outputs = new Outputs(this, compile, {cache});
    }

    async _begin() {
        await this.#processor.ready;
        await this.#outputs.load();
    }

    get hash() {
        throw new Error('Property ".hash" must be overridden');
    }

    async _compile(request) {
        void request;
        throw new Error('Method "._compile(request)" must be overridden');
    }

    _process() {
        !this.#outputs.updated && this.#outputs.clear();
        return !this.#outputs.updated;
    }
}
