module.exports = class extends Map {
    #generate;

    constructor(generate) {
        super();
        this.#generate = generate;
    }

    obtain(resource, hmr) {
        if (!['code', 'map', 'errors', 'warnings'].includes(resource)) throw new Error('Invalid parameters');

        if (this.has(hmr)) return this.get(hmr)[resource];

        const values = this.#generate(hmr);
        if (typeof values !== 'object') throw new Error('Invalid returned data from outputs generation');

        const {code, map, errors, warnings} = values;
        this.set(hmr, {code, map, errors, warnings});
        return values[resource];
    }
}
