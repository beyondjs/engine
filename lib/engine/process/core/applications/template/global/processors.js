const Processor = require('./processor');

module.exports = class {
    #config;
    #distributions = new Map();

    constructor(config) {
        this.#config = config;
    }

    get(distribution, language) {
        language = language ? language : '.';
        const key = `${distribution.key}//${language}`;
        if (this.#distributions.has(key)) return this.#distributions.get(key);

        const processor = new Processor(this.#config, distribution, language);
        this.#distributions.set(key, processor);
        return processor;
    }
}
