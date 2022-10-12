const Processor = require('./processor');

module.exports = class {
    #config;
    #compilations = new Map();

    constructor(config) {
        this.#config = config;
    }

    get(cspecs, language) {
        language = language ? language : '.';
        const key = `${cspecs.key()}//${language}`;
        if (this.#compilations.has(key)) return this.#compilations.get(key);

        const processor = new Processor(this.#config, cspecs, language);
        this.#compilations.set(key, processor);
        return processor;
    }
}
