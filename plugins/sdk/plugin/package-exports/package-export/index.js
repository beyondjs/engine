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

    #targetedExports = new Map();

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

    getTargetedExport(platform) {
        if (this.#targetedExports.has(platform)) return this.#targetedExports.get(platform);

        const targetedExport = this.#creator.createTargetedExport(this, platform);
        this.#targetedExports.set(platform, targetedExport);
        return targetedExport;
    }

    configure(config) {
        this.#config.set(config);
    }

    destroy() {
        this.#targetedExports.forEach(targetedExport => targetedExport.destroy());
    }
}
