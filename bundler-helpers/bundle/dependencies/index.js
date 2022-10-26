const Processor = require('./processor');

module.exports = class {
    #bundle;
    #processors = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform, language) {
        const key = `${platform}` + (language ? `/${language}` : '');
        if (this.#processors.has(key)) return this.#processors.get(key);

        const processor = new Processor(this.#bundle, platform, language);
        this.#processors.set(key, processor);
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
