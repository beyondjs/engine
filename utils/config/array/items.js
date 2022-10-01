const equal = (require('../../equal'));

module.exports = class extends Map {
    #property;
    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    constructor(property) {
        super();
        this.#property = property;
    }

    update() {
        let {value, branch} = this.#property;
        value = value ? value : [];
        const errors = [];
        if (value && !(value instanceof Array)) {
            errors.push(`Items of branch "${this.#property.branch}" cannot be updated. ` +
                `Its parent value should be an "array", however it is "${typeof value}"`);
            value = [];
        }

        const updated = new Map();
        for (const data of value) {
            const p = require('path');

            let path = typeof data === 'string' ? p.dirname(data) : data?.path;
            if (!path) continue;
            path = p.join(this.#property.path, path);

            const property = this.has(path) ? this.get(path) :
                new (require('../object'))(undefined, undefined, `${branch}/children`, this.#property);

            updated.set(path, property);
            property.data = data
            if (property.path !== path) throw new Error(`Invalid property path "${property.path}" !== "${path}"`);
        }

        const changed = updated.size !== this.size || !equal(this.#errors, errors) ||
            [...updated.keys()].reduce((prev, path) => prev || !this.has(path), false);

        this.#errors = errors;

        // Destroy unused properties
        this.forEach((property, path) => !updated.has(path) && property.destroy());

        // Copy the updated properties
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }

    destroy() {
        if (this.#destroyed) throw new Error('Properties already destroyed');
        this.#destroyed = true;

        this.forEach(property => property.destroy());
        super.clear();
    }
}
