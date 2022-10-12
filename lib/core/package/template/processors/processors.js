const Processor = require('./processor');

module.exports = class {
    #name; // Can be 'scss', 'less' or 'sass'
    #config;
    #compilations = new Map();

    constructor(name, config) {
        this.#name = name;
        this.#config = config;
    }

    get(cspecs, language) {
        language = language ? language : '.';
        const key = `${cspecs.key()}//${language}`;
        if (this.#compilations.has(key)) return this.#compilations.get(key);

        const processor = new Processor(this.#name, this.#config, cspecs, language);
        this.#compilations.set(key, processor);
        return processor;
    }
}
