const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ts = require('typescript');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'ts-processor.analyzer.sources-ast';
    }

    #collection;
    #hashes = new Map();

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
            const {file, hash, content} = source;
            const ast = (() => {
                if (this.has(file) && this.#hashes.get(file) === hash) return this.get(file);
                changed = true;
                return ts.createSourceFile(file, content);
            })();
            updated.set(file, {hash, ast});
        });

        this.clear();
        this.#hashes.clear();

        updated.forEach(({hash, ast}, file) => {
            this.set(file, ast);
            this.#hashes.set(file, hash);
        });
        return changed;
    }
}
