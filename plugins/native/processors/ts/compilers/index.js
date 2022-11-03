const Typecheck = require('./typecheck');
const Transpiler = require('./transpiler');

module.exports = class {
    #processor;
    #compilers = new Map();

    constructor(processor) {
        this.#processor = processor;
    }

    get(name) {
        if (!['default', 'typecheck'].includes(name)) throw new Error('Invalid parameters');
        if (this.#compilers.has(name)) return this.#compilers.get(name);

        const Compiler = name === 'typecheck' ? Typecheck : Transpiler;
        const compiler = new Compiler(this.#processor);
        this.#compilers.set(name, compiler);
        return compiler;
    }
}
