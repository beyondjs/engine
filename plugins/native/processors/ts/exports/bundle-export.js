const {NamespaceJS} = require('beyond/plugins/sdk');

module.exports = class {
    #imSpecifier;
    get imSpecifier() {
        return this.#imSpecifier;
    }

    #name;
    get name() {
        return this.#name;
    }

    #kind;
    /**
     * The kind of export
     * @return {string} Can be 'export', 'type'
     */
    get kind() {
        return this.#kind;
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
        this.#imSpecifier = NamespaceJS.name(source.relative.file);

        const {name, kind, line, character} = sourceExport;
        this.#name = name;
        this.#kind = kind;
        this.#line = line;
        this.#character = character;
    }
}
