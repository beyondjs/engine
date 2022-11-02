const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'processor.compiler';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    get id() {
        return this.#processor.id;
    }

    get hash() {
        return this.#processor.hash;
    }

    constructor(processor) {
        super();
        this.#processor = processor;
    }

    async _compile() {
    }
}
