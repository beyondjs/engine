/**
 * Processors extensions by distribution
 */
module.exports = class {
    #distributions = new Map();

    #processor;
    get processor() {
        return this.#processor;
    }

    get(distribution) {
        const {key} = distribution;
        if (this.#distributions.has(key)) return this.#distributions.get(key);

        const extender = new (require('./extender'))(this.#processor, distribution);
        this.#distributions.set(key, extender);
        return extender;
    }
}
