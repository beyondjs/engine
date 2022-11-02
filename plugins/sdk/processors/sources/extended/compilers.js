const DynamicProcessor = require('beyond/utils/dynamic-processor');

/**
 * The compilers of the processors that are being extended by the current processor.
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'processor.compiler.extended.compilers';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    constructor(processor) {
        super();
        this.#processor = processor;

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

        // Subscribe extended compilers that are new to the collection
        let changed = false;
        updated.forEach((compiler, processor) => !this.has(processor) && (changed = true));
        this.forEach((extension, compiler) => !updated.has(compiler) && (changed = true));
        if (!changed) return false;

        super.clear(); // Do not use this.clear() as it would destroy still used extensions
        updated.forEach((value, key) => this.set(key, value));
    }
}
