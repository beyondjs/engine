const ts = require('typescript');
const tsKind = ts.SyntaxKind;

module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #node;
    get node() {
        return this.#node;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
    }

    get kind() {
        const {TypeAliasDeclaration, InterfaceDeclaration} = tsKind;
        return [TypeAliasDeclaration, InterfaceDeclaration].includes(this.#node.kind) ? 'type' : 'export';
    }

    constructor(name, source, node) {
        this.#name = name;
        this.#node = node;

        const {line, character} = source.getLineAndCharacterOfPosition(node.getStart(source));
        this.#line = line;
        this.#character = character;
    }
}
