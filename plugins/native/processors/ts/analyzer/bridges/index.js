const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Bridge = require('./bridge');

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

                const bridge = new Bridge(file, ast);
                if (!bridge.valid) return;

                changed = true;
                return bridge;
            })();
            updated.set(file, analyzer);
        });

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }
}
