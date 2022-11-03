const DynamicProcessor = require('beyond/utils/dynamic-processor');
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
     * Code constructor
     *
     * @param processor {*}
     * @param specs {{cache: boolean}} Cache enabled or not
     */
    constructor(processor, specs) {
        super();
        this.#processor = processor;
        this.#id = `${processor.id}//${this.resource}`;

        specs = specs ? specs : {};
        const {cache} = specs;

        const build = async request => await this._build(request);
        this.#outputs = new Outputs(this, build, {cache});
    }

    async _begin() {
        await this.#processor.ready;
        await this.#outputs.load();
    }

    get hash() {
        throw new Error('Property ".hash" must be overridden');
    }

    async _build(request) {
        void request;
        throw new Error('Method "._build(request)" must be overridden');
    }

    _process() {
        !this.#outputs.updated && this.#outputs.clear();
        return !this.#outputs.updated;
    }
}
