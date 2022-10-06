const ts = require('typescript');

module.exports = class {
    #file;
    get file() {
        return this.#file;
    }

    #message;
    get message() {
        return this.#message;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
    }

    constructor(diagnostic) {
        this.#message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

        if (!diagnostic.file) return;

        this.#file = diagnostic.file.fileName;
        const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        this.#line = position.line;
        this.#character = position.character;
    }

    toJSON() {
        return {
            file: this.#file,
            message: this.#message,
            line: this.#line,
            character: this.#character
        }
    }
}
