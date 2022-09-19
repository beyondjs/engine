const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

/**
 * Hash of a collection of sources. It is used by files and overwrites
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.sources.hash';
    }

    constructor(sources) {
        super();
        super.setup(new Map([['sources', {child: sources}]]));
    }

    #value;
    get value() {
        return this.#value;
    }

    _prepared(require) {
        const sources = this.children.get('sources').child;
        sources.forEach(source => require(source));
    }

    _process() {
        const done = value => {
            const changed = this.#value !== value;
            this.#value = value;
            return changed;
        }

        const sources = this.children.get('sources').child;
        if (!sources.size) return done(0);

        const compute = {};
        sources.forEach(source => compute[source.relative.file] = source.hash);
        return done(crc32(equal.generate(compute)));
    }
}
