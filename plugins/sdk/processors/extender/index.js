/**
 * Processors extensions
 */
module.exports = class extends Map {
    #processor;
    get processor() {
        return this.#processor;
    }

    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    constructor(processor) {
        super();
        this.#processor = processor;

        const {meta} = processor;
        const {Preprocessor, extends: _extends} = meta.extender;
        this.#preprocessor = new Preprocessor(processor);

        _extends.forEach(processorName => {
            const extension = new (require('./extension'))(processorName, this.#preprocessor);
            this.set(processorName, extension);
        });
    }
}
