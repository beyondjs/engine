const SourcesAST = require('./sources-ast');
const SourcesAnalyzer = require('./sources-analyzer');

module.exports = class {
    #files;
    get files() {
        return this.#files;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    #bridges;
    get bridges() {
        return this.#bridges;
    }

    constructor(sources) {
        this.#ast = new SourcesAST(sources);
        this.#files = new SourcesAnalyzer(this.#ast.files);
        // this.#extensions = new Sources(this.#ast.extensions);
    }
}
