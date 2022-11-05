const DynamicProcessor = require('beyond/utils/dynamic-processor');
const SourceAnalyzer = require('./source-analyzer');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'ts-processor.analyzer.sources-analyzer';
    }

    #sourcesAST;

    constructor(sourcesAST) {
        super();
        this.#sourcesAST = sourcesAST;
    }

    _prepared(require) {
        if (!require(this.#sourcesAST)) return false;
    }

    _process() {
        const sourcesAST = this.#sourcesAST;

        let changed = false;
        const updated = new Map();

        sourcesAST.forEach((sourceAST, file) => {
            const analyzer = (() => {
                if (this.has(file) && this.get(file).hash === sourceAST.hash) return this.get(file);
                changed = true;
                return new SourceAnalyzer(file, sourceAST.ast);
            })();
            updated.set(file, analyzer);
        });

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }
}
