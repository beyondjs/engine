module.exports = class extends Map {
    #dependencies;

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;
    }

    add(specifier, is) {
        is = is ? is : new Set(['import']);
        this.set(specifier, is);
    }
}
