const DynamicProcessor = require('beyond/utils/dynamic-processor');

/**
 * The extensions of the processors that are extending the current processor.
 * Example: if the current processor is the "ts" processor, then an extension of it could be the "ts" extension
 * of the "svelte" processor
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'processor.sources.extensions.processors';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    constructor(processor) {
        super();
        this.#processor = processor;

        const {processors} = processor.specs.packager;
        super.setup(new Map([['bundle.processors', {child: processors}]]));
    }

    _process() {
        const processors = this.children.get('bundle.processors').child;

        /**
         * Loop through the processors in the bundle to find which ones extend the current processor
         */
        const updated = new Map();
        processors.forEach(processor => {
            if (!processor.extender || !processor.extender.has(this.#processor.name)) return;
            const extension = processor.extender.get(this.#processor.name);
            updated.set(processor.name, extension.hashes);
        });

        let changed = false;
        updated.forEach((extension, processor) => !this.has(processor) && (changed = true));
        this.forEach((extension, processor) => !updated.has(processor) && (changed = true));
        if (!changed) return false;

        super.clear(); // Do not use this.clear() as it would destroy still used extensions
        updated.forEach((value, key) => this.set(key, value));
    }
}
