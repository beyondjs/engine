const {ProcessorIMOutput} = require('beyond/plugins/sdk');

module.exports = class {
    #imSpecifier;
    get imSpecifier() {
        return this.#imSpecifier;
    }

    #name;
    get name() {
        return this.#name;
    }

    #from;
    get from() {
        return this.#from;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
    }

    constructor(source, sourceExport) {
        this.#imSpecifier = ProcessorIMOutput.specifier(source);

        const {name, from, line, character} = sourceExport;
        this.#name = name;
        this.#from = from;
        this.#line = line;
        this.#character = character;
    }
}
