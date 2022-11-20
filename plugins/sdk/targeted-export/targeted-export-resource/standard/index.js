const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Preprocessor = require('./preprocessor');
const Outputs = require('./outputs');

/**
 * This is the object used directly by standard exports, and that is specialized to be used by the plugins
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.export';
    }

    get resource() {
        throw new Error('Property ".resource" must be overridden. Ex: "js", "css", "types"');
    }

    #targetedExport;
    get targetedExport() {
        return this.#targetedExport;
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
     * It allows to the _preprocess method to know if its execution has been cancelled or not
     * @param request
     * @return {boolean}
     */
    cancelled(request) {
        return request.is === 'reprocessor' ? this.#preprocessor.cancelled(request) : super.cancelled(request);
    }

    /**
     * Code constructor
     *
     * @param targetedExport {*}
     * @param specs {{cache: boolean, preprocessor: boolean}} Cache enabled or not
     */
    constructor(targetedExport, specs) {
        super();
        this.#targetedExport = targetedExport;
        this.#id = `${targetedExport.id}//${this.resource}`;

        specs = specs ? specs : {};
        const {cache} = specs;

        const preprocess = async request => await this._preprocess(request);
        this.#preprocessor = specs.preprocessor && new Preprocessor(this, preprocess, {cache});

        const build = local => this._build(local);
        this.#outputs = new Outputs(this, build, {cache});
    }

    async _begin() {
        await this.#targetedExport.ready;
        await this.#outputs.load();
    }

    /**
     * Expected to be overridden
     * @return {number}
     */
    get hash() {
        throw new Error('Property ".hash" must be overridden');
    }

    /**
     * This method can be overridden (optional) if implementation requires asynchronous processing
     * previous to the construction of the code or map properties
     *
     * @param request
     * @return {Promise<void>}
     * @private
     */
    async _preprocess(request) {
        void request;
        if (this.#preprocessor) throw new Error('Method "._preprocess" must be overridden');
    }

    /**
     * This method should be overridden to build the outputs
     *
     * @param hmr {number} The identifier of the build from which the bundle is required to be updated
     * @private
     */
    async _build(hmr) {
        throw new Error('This method should be overridden');
    }

    _process() {
        !this.#preprocessor?.updated && this.#preprocessor?.invalidate();
        !this.#outputs.updated && this.#outputs.clear();

        return !this.#outputs.updated;
    }
}
