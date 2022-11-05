const SourcesAST = require('./sources-ast');
const SourcesAnalyzer = require('./sources-analyzer');
const Bridges = require('./bridges');

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
        const ast = new SourcesAST(sources);
        this.#files = new SourcesAnalyzer(ast.files);
        // this.#extensions = new Sources(ast.extensions);
        // this.#bridges = new Bridges(ast.files);
    }
}
