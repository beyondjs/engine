const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The extensions hashes of the processors that are extending the current processor.
 * Example: if the processor is "ts", an extension of it could be the "ts" extension of the "svelte" processor
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.sources.extensions.processors';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #propagator;

    constructor(processor) {
        super();
        this.#processor = processor;
        this.#propagator = new (require('./propagator'))(this._events);

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

        // Subscribe extensions that are new to the collection
        const subscribe = [];
        updated.forEach((extension, processor) => !this.has(processor) && subscribe.push(extension));
        this.#propagator.subscribe(subscribe);
        changed = subscribe.length;

        // Unsubscribe unused extensions
        const unsubscribe = [];
        this.forEach((extension, processor) => !updated.has(processor) && unsubscribe.push(extension));
        this.#propagator.subscribe(unsubscribe);
        changed = changed || unsubscribe.length;

        if (!changed) return false;

        super.clear(); // Do not use this.clear() as it would destroy still used extensions
        updated.forEach((value, key) => this.set(key, value));
    }
}
