module.exports = class {
    #application;
    #consumers = new Map();

    constructor(application) {
        this.#application = application;
    }

    get(distribution, language) {
        const key = `${distribution.key}/${language}`;
        if (this.#consumers.has(key)) return this.#consumers.get(key);

        const consumers = new (require('./consumers'))(this.#application, distribution, language);
        this.#consumers.set(key, consumers);
        return consumers;
    }
}
