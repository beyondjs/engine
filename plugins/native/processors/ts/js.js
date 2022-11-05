const {ProcessorCode} = require('beyond/plugins/sdk');
const Analyzer = require('./analyzer');
const Dependencies = require('./dependencies');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    #analyzer;
    get analyzer() {
        return this.#analyzer;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    get hash() {
        return this.processor.hash;
    }

    constructor(...params) {
        super(...params);

        this.#analyzer = new Analyzer(this.processor.sources);
        this.#dependencies = new Dependencies(this.#analyzer);
    }

    async _build(request) {
        const compiler = this.processor.compilers.get('default');
        await compiler.outputs.ready;
        if (this.cancelled(request)) return;

        const ims = compiler.outputs.data;
        return {ims};
    }
}
