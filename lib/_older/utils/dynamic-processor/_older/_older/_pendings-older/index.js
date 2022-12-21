const registry = require('./registry');

module.exports = class extends Map {
    #parent;

    constructor(parent) {
        super();
        this.#parent = parent;
    }

    clear() {
        registry.
        super.clear();
    }
}
