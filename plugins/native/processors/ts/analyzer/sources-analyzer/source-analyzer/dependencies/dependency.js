module.exports = class {
    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #is;
    /**
     * Can be 'import', 'type', 'dynamic.import', 'internal.import'
     * @return {string}
     */
    get is() {
        return this.#is;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
    }

    constructor(specifier, is, source, node) {
        this.#specifier = specifier;
        this.#is = is;
        const {line, character} = source.getLineAndCharacterOfPosition(node.getStart(source));

        this.#line = line;
        this.#character = character;
    }
}
