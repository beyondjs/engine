module.exports = class extends Map {
    #dp;
    get dp() {
        return this.#dp;
    }

    constructor(dp) {
        super();
        this.#dp = dp;
    }

    /**
     * Register children of the dp, can be additional to the previous registered children
     *
     * @param children {Map<string, object>} The children specification
     * @param invalidate {boolean} If true, invalidates the dp after the registration of the children
     */
    register(children, invalidate) {
        if (!children) return;
        if (!(children instanceof Map)) throw new Error('Invalid parameters');

        let changed;

        children.forEach((specs, name) => {
            if (!specs) throw new Error(`Invalid specification of child "${name}". Specification is undefined`);
            const {child} = specs
            require('./validate-child')(child, name);

            if (this.has(name) && specs.child !== this.get(name).child) {
                throw new Error(`Child "${name}" already registered with a different dp`);
            }
            if (this.has(name)) return; // Child already registered

            this.set(name, specs);
            changed = true;
        });

        changed && invalidate && this.#dp._invalidate();
    }

    unregister(children, invalidate = true) {
        if (!(children instanceof Array)) throw new Error('Invalid parameters');

        let changed = false;
        children.forEach(name => {
            if (!this.has(name)) return;
            changed = true;
            this.delete(name);
        });

        invalidate && changed && this.#dp._invalidate();
    }
}
