/**
 * Package export
 */
module.exports = class {
    #plugin;
    get plugin() {
        return this.#plugin;
    }

    #subpath;
    get subpath() {
        return this.#subpath();
    }

    #data;
    get data() {
        return this.#data;
    }

    #conditionals = new Map();

    constructor(plugin, subpath, data) {
        this.#plugin = plugin;
        this.#subpath = subpath;
        this.#data = data;
    }

    conditional(platform) {
        if (this.#conditionals.has(platform)) return this.#conditionals.get(platform);

        const conditional = this.#plugin.conditional(this, platform);
        this.#conditionals.set(platform, conditional);
        return conditional;
    }
}
