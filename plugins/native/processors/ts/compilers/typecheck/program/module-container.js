const {normalize} = require('path');

module.exports = class {
    #module;
    get module() {
        return this.#module;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    constructor(compiler, module) {
        this.#module = normalize(module);

        if (this.#module.startsWith(compiler.processor.path)) {
            this.#pkg = compiler.processor.pkg;
        }
    }
}
