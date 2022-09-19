const Processor = require('./item');
const TYPES = require('./types');
module.exports = class {
    #items = new Map();
    get items() {
        return this.#items;
    }

    TYPES = TYPES;
    #types = new Set()
    get types() {
        return this.#types;
    }

    #bundle;
    #viewProcessors = ['vue', 'svelte'];

    constructor(bundle, specs) {
        this.#bundle = bundle;
        TYPES.forEach((skeleton, name) => this.#types.add(name));
        const keys = Object.keys(specs);
        keys.forEach(property => {
            if (this.#types.has(property)) {
                this.add(property, specs[property]);
            }
        });
    }

    add(items, specs) {
        if (typeof items === 'string') items = [items];
        items.forEach(item => {
            if (this.#items.has(item)) return;
            let specified = TYPES.has(item) ? TYPES.get(item) : {};
            specs = {...specs, ...specified};

            /*
             * if the bundle has a view renderer, the path points to the same folder with the view renderer name
             * @this.#viewProcessors
             */
            if (!specs.processors) return;
            const filter = specs.processors.filter(i => this.#viewProcessors.includes(i));
            if (filter.length) specs.path = filter[0];

            const processor = new Processor(this.#bundle, item, specs);
            this.#items.set(item, processor);
        });
    }

    check(processors) {
        if (!processors?.length) return;
        for (const processor of processors) {
            // The processor is included only if is defined as a processorType and is not
            // included by default in the bundle
            if (!this.#types.has(processor)) continue;
            this.add(processor);
        }
    }
}