const DynamicProcessor = require('beyond/utils/dynamic-processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

/**
 * Hash of a collection of sources. It is used by the files
 */
module.exports = class extends DynamicProcessor() {
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