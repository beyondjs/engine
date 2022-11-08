const Config = require('./config');
const Specifier = require('./specifier');

/**
 * Package export
 */
module.exports = class {
    #plugin;
    get plugin() {
        return this.#plugin;
    }

    get module() {
        return this.#plugin.module;
    }

    get pkg() {
        return this.#plugin.module.pkg;
    }

    #creator;

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #id;
    get id() {
        return this.#id;
    }

    #conditionals = new Map();

    #config;
    get config() {
        return this.#config;
    }

    constructor(plugin, subpath, creator) {
        this.#plugin = plugin;
        this.#creator = creator;
        this.#subpath = subpath;
        this.#specifier = new Specifier(this);
        this.#id = `${this.#plugin.id}//${subpath}`;

        this.#config = new Config();
    }

    condition(platform) {
        if (this.#conditionals.has(platform)) return this.#conditionals.get(platform);

        const conditional = this.#creator.conditional(this, platform);
        this.#conditionals.set(platform, conditional);
        return conditional;
    }

    configure(config) {
        this.#config.set(config);
    }

    destroy() {
        this.#conditionals.forEach(conditional => conditional.destroy());
    }
}
