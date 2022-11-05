const DynamicProcessor = require('beyond/utils/dynamic-processor');
const SourceAST = require('./source');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'ts-processor.analyzer.sources-ast';
    }

    #collection;

    constructor(collection) {
        super();
        this.#collection = collection;
    }

    _prepared(require) {
        if (!require(this.#collection)) return false;
        this.#collection.forEach(source => require(source));
    }

    _process() {
        let changed = false;
        const updated = new Map();

        this.#collection.forEach(source => {
            const {file, hash} = source;
            const sourceAST = (() => {
                if (this.get(file)?.hash === hash) return this.get(file);
                changed = true;
                return new SourceAST(source);
            })();

            updated.set(file, sourceAST);
        });

        this.clear();
        updated.forEach((sourceAST, file) => this.set(file, sourceAST));
        return changed;
    }
}
