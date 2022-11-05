const ts = require('typescript');

module.exports = class {
    #source;
    get source() {
        return this.#source;
    }

    get file() {
        return this.#source.file;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #ast;
    get ast() {
        return this.#ast;
    }

    constructor(source) {
        this.#source = source;
        this.#hash = source.hash;

        const {file, content} = source;
        this.#ast = ts.createSourceFile(file, content);
    }
}
