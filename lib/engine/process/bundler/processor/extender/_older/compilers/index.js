module.exports = class {
    #processor;
    #distributions = new Map();

    constructor(processor) {
        this.#processor = processor;
    }

    get(distribution) {
        const {key} = distribution;
        if (this.#distributions.has(key)) return this.#distributions.get(key);

        const {Compiler} = this.#processor.meta.extender;
        const compiler = new Compiler(this.#processor, distribution);

        this.#distributions.set(key, compiler);
        return compiler;
    }
}
