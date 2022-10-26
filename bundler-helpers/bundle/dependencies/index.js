const Processor = require('./processor');

module.exports = class {
    #bundle;
    #processors = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform) {
        if (this.#processors.has(platform)) return this.#processors.get(platform);

        const processor = new Processor(this.#bundle, platform);
        this.#processors.set(platform, processor);
        return processor;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #clear = () => {
        this.#processors.forEach(processor => processor.destroy());
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#clear();
    }
}
