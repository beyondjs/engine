const Cache = require('./cache.js');
const Package = require('./package.js');

module.exports = class extends Map {
    #cache;

    constructor(specs) {
        super();
        this.#cache = new Cache(specs.cache);
    }

    obtain(name) {
        if (this.has(name)) return this.get(name);

        const pkg = new Package(name, this.#cache);
        this.set(name, pkg);
        return pkg;
    }
}
