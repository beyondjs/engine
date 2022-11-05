module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
    }

    constructor(name, source, node) {
        this.#name = name;
        const {line, character} = source.getLineAndCharacterOfPosition(node.getStart(source));

        this.#line = line;
        this.#character = character;
    }
}
