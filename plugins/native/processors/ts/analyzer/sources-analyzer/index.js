const DynamicProcessor = require('beyond/utils/dynamic-processor');
const SourceAnalyzer = require('./source-analyzer');

module.exports = class extends DynamicProcessor(Map) {
    #sourcesAST;

    constructor(sourcesAST) {
        super();
        this.#sourcesAST = sourcesAST;
    }

    _prepared(require) {
        const sources = this.#sourcesAST;
        if (!require(sources)) return false;

        sources.forEach(source => require(source));
    }

    _process() {
        const sources = this.#sourcesAST;

        let changed = false;
        const updated = new Map();

        sources.forEach((ast, file) => {
            const analyzer = (() => {
                if (this.has(file)) return this.get(file);
                changed = true;
                return new SourceAnalyzer(file, ast);
            })();
            updated.set(file, analyzer);
        });

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }
}
