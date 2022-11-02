const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Generator = require('./generator');

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

    #generator;
    get generator() {
        return this.#generator;
    }

    get data() {
        return this.#generator?.data;
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
        return this.#generator?.cancelled(request);
    }

    /**
     * Code constructor
     *
     * @param processor {*}
     * @param specs {{cache: boolean, generator: boolean}} Cache enabled or not
     */
    constructor(processor, specs) {
        super();
        this.#processor = processor;
        this.#id = `${processor.id}//${this.resource}`;

        specs = specs ? specs : {};
        const {cache} = specs;

        const update = async request => await this._update(request);
        this.#generator = specs.generator && new Generator(this, update, {cache});

        const generate = () => this._generate();
        this.#outputs = new Outputs(this, generate, {cache});
    }

    async _begin() {
        await this.#processor.ready;
        await this.#outputs.load();

        if (this.#outputs.updated) return;
        await this.#generator?.load();
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
     *
     * @param hmr
     * @private
     */
    _generate(hmr) {
        throw new Error('This method should be overridden');
    }

    _process() {
        !this.#generator?.updated && this.#generator?.invalidate();
        !this.#outputs.updated && this.#outputs.clear();

        return !this.#outputs.updated;
    }
}
