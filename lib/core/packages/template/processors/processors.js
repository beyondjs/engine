const Processor = require('./processor');

module.exports = class {
    #name; // Can be 'scss', 'less' or 'sass'
    #config;
    #distributions = new Map();

    constructor(name, config) {
        this.#name = name;
        this.#config = config;
    }

    get(distribution, language) {
        language = language ? language : '.';
        const key = `${distribution.key}//${language}`;
        if (this.#distributions.has(key)) return this.#distributions.get(key);

        const processor = new Processor(this.#name, this.#config, distribution, language);
        this.#distributions.set(key, processor);
        return processor;
    }
}
