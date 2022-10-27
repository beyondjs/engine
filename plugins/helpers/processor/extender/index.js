/**
 * Processors extensions
 */
module.exports = class extends Map {
    #processor;
    get processor() {
        return this.#processor;
    }

    #cspecs;
    get cspecs() {
        return this.#cspecs;
    }

    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    constructor(processor, cspecs) {
        super();
        this.#processor = processor;
        this.#cspecs = cspecs;

        const {meta} = processor;
        const {Preprocessor, extends: _extends} = meta.extender;
        this.#preprocessor = new Preprocessor(processor, cspecs);

        _extends.forEach(processorName => {
            const extension = new (require('./extension'))(processorName, this.#preprocessor);
            this.set(processorName, extension);
        });
    }
}
