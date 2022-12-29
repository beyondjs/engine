const Dependency = require('./dependency');

module.exports = class {
    #elements = new Map();
    get elements() {
        return this.#elements;
    }

    get(specifier) {
        const elements = this.#elements;
        if (elements.has(specifier)) return elements.get(specifier);

        const dependency = new Dependency(elements.size);
        elements.set(specifier, dependency);
        return dependency;
    }
}
