module.exports = class extends Map {
    #processor;

    // Manages full initialization of children
    #initialisation;

    get waiting() {
        return new Map([...this].filter(([, {child}]) => !child.processed));
    }

    constructor(processor) {
        super();
        this.#processor = processor;
        this.#initialisation = new (require('./initialisation'))(processor);
    }

    get prepared() {
        if (!this.#initialisation.completed) return false;

        // If at least one of the children is not processed, then children is not prepared
        return ![...this.values()].find(processor => !processor.child.processed);
    }

    /**
     * Register children of the processor, can be additional to the previous registered children
     *
     * @param children {Map<string, object>} The children specification
     * @param invalidate {boolean} If true, invalidates the processor after the registration of the children
     * @param constructor {boolean} Some classes specializations are using private properties
     * for the this.#processor.initialised and this.#processor.initialising getters,
     * so they cannot be called if the method is invoked from the constructor of the processor
     */
    register(children, invalidate, constructor) {
        if (!children) return;
        if (!(children instanceof Map)) throw new Error('Invalid parameters');

        let changed;

        children.forEach((specs, name) => {
            if (!specs) throw new Error(`Invalid specification of child "${name}". Specification is undefined`);
            if (this.has(name) && specs.child !== this.get(name).child) {
                throw new Error(`Child "${name}" already registered with a different object`);
            }
            if (this.has(name)) return; // Child already registered

            const {child, events} = specs
            const wrapper = new (require('./child'))(name, this.#processor, child, events);
            this.set(name, wrapper);
            changed = true;

            this.#initialisation.register(name, specs.child);

            // Start child initialisation if the processor is already initialised or initialising
            if (!constructor && (this.#processor.initialised || this.#processor.initialising)) {
                !child.initialised && !child.initialising && child.initialise();
            }
        });

        changed && invalidate && this.#processor._invalidate();
    }

    unregister(children, invalidate = true) {
        if (!(children instanceof Array)) throw new Error('Invalid parameters');

        let changed = false;
        children.forEach(name => {
            if (!this.has(name)) return;
            changed = true;
            this.#initialisation.unregister(name);
            this.get(name).destroy();
            this.delete(name);
        });

        invalidate && changed && this.#processor._invalidate();
    }

    async initialise() {
        await this.#initialisation.initialise();
    }

    destroy() {
        this.unregister([...this.keys()]);
        this.#initialisation.destroy();
    }
}
