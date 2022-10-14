const Cache = require('./cache.js');
const Package = require('./package.js');

module.exports = new class extends Map {
    #cache;

    constructor() {
        super();
        this.#cache = new Cache();
    }

    obtain(name) {
        if (this.has(name)) return this.get(name);

        const pkg = new Package(name, this.#cache);
        this.set(name, pkg);
        return pkg;
    }
}
