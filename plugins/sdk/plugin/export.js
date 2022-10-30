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

    #id;
    get id() {
        return this.#id;
    }

    #conditionals = new Map();

    constructor(plugin, subpath, data) {
        this.#plugin = plugin;
        this.#subpath = subpath;
        this.#data = data;
        this.#id = `${this.#plugin.id}//${subpath}`;
    }

    conditional(platform) {
        if (this.#conditionals.has(platform)) return this.#conditionals.get(platform);

        const conditional = this.#plugin.conditional(this, platform);
        this.#conditionals.set(platform, conditional);
        return conditional;
    }
}
