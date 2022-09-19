const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The compilers of the processors that are being extended by the current processor.
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.compiler.extended.compilers';
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
        super.setup(new Map([['processors', {child: processors}]]));
    }

    _process() {
        if (!this.children.has('processors')) return;
        const processors = this.children.get('processors').child;

        const {meta} = this.#processor;
        const {extends: _extends} = meta.extender;

        const updated = new Map();
        processors.forEach(processor => {
            const {name} = processor;
            if (!_extends.includes(name)) return;
            updated.set(name, processor.packager.compiler);
        });

        let changed = false;

        // Subscribe extended compilers that are new to the collection
        const subscribe = [];
        updated.forEach((compiler, processor) => !this.has(processor) && subscribe.push(compiler));
        this.#propagator.subscribe(subscribe);
        changed = subscribe.length;

        // Unsubscribe unused extended compilers
        const unsubscribe = [];
        this.forEach((extension, compiler) => !updated.has(compiler) && unsubscribe.push(extension));
        this.#propagator.subscribe(unsubscribe);
        changed = changed || unsubscribe.length;

        if (!changed) return false;

        super.clear(); // Do not use this.clear() as it would destroy still used extensions
        updated.forEach((value, key) => this.set(key, value));
    }
}
