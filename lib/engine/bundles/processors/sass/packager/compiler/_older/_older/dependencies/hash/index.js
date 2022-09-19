const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'sass.compiler.dependencies';
    }

    #value;
    get value() {
        if (!this.processed) throw new Error(`Processor "${this.dp}" is not ready`);
        if (this.#value !== void 0) return this.#value;
        const {children} = this;

        const compute = {};
        children.forEach(({child: hash}, key) => compute[key] = hash.value);

        console.log('compute hash', compute);

        return this.#value = crc32(equal.generate(compute));
    }

    _process() {
        this.#value = void 0;
    }

    update(children) {
        const previous = this.children;
        console.log('update children, current children', [...previous.keys()]);

        // Remove previously registered children that is not currently required
        const unregister = [];
        previous.forEach((child, key) => !children.has(key) && unregister.push(key));
        unregister.length && this.children.unregister(unregister);

        console.log('update children, unregister:', unregister);

        // Register the children
        const register = new Map();
        children.forEach((child, key) => !previous.has(key) && register.set(key, {child: child}));
        register.size && this.children.register(register);

        console.log('update children, register:', [...register.keys()]);
        if (unregister.length || register.size) {
            this._invalidate();
            this.#value = void 0;
        }
    }
}
