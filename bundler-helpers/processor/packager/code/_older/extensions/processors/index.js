const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The extensions of the processors that are extending the current processor.
 * Example: if the processor is "ts", an extension of it could be the "ts" extension of the "svelte" processor
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.code.extensions.processors';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #propagator;

    constructor(packager) {
        super();
        this.#packager = packager;
        this.#propagator = new (require('./propagator'))(this._events);

        const {processors} = packager.processor.specs.packager;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    _process() {
        if (!this.children.has('processors')) return;
        const processors = this.children.get('processors').child;
        const {distribution} = this.#packager;

        const updated = new Map();
        processors.forEach(processor => {
            const {name} = this.#packager.processor;
            if (!processor.extender || !processor.extender.has(name)) return;

            const extension = processor.extender.get(name);
            updated.set(name, extension.code(distribution));
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

    clear() {
        this.forEach(extension => extension.destroy());
    }

    destroy() {
        this.clear();
        super.destroy();
    }
}
