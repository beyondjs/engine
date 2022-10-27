module.exports = class {
    // The template functions code
    #functions;

    constructor(functions) {
        this.#functions = functions;
    }

    #lines;
    get lines() {
        this.#process();
        return this.#lines;
    }

    #code;
    get code() {
        this.#process();
        return this.#code;
    }

    #process() {
        if (this.#code !== undefined) return;

        if (!this.#functions.valid) throw new Error('Processor functions has errors');
        const processor = this.#functions.instance;

        // Chek if the processor is configured
        if (!processor) return '';

        const {files} = processor;

        let code = '';
        files.forEach(source => code += `${source.content}\n\n`);

        this.#code = code;
        this.#lines = code ? (code.length - code.replace(/\n/g, '').length + 1) : 0;
    }

    invalidate() {
        this.#code = this.#lines = void 0;
    }
}
