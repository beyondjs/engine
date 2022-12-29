const Dependency = require('./dependency');

/**
 * Internal modules get a dependency object from this collection of dependencies
 * to record which dependencies are used and identify which of them do default import and/or namespace import
 */
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
