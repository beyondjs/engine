module.exports = class {
    #pkg;
    #consumers = new Map();

    constructor(pkg) {
        this.#pkg = pkg;
    }

    get(cspecs, language) {
        const key = `${cspecs.platform}/${language}`;
        if (this.#consumers.has(key)) return this.#consumers.get(key);

        const consumers = new (require('./consumers'))(this.#pkg, cspecs, language);
        this.#consumers.set(key, consumers);
        return consumers;
    }
}
