const ipc = require('beyond/utils/ipc');
const Properties = require('./properties');
const Exports = require('./exports');
const equal = require('beyond/utils/equal');

module.exports = class {
    #module;
    get module() {
        return this.#module;
    }

    #id;
    get id() {
        return this.#id;
    }

    #properties;
    get properties() {
        return this.#properties;
    }

    #exports = new Map();
    get exports() {
        return this.#exports;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'plugins-exports'
        });
    }

    /**
     * Plugin constructor
     * @param name {string} The name is the exact plugin static property .name
     * @param module {*} The module that contains the plugin instance
     */
    constructor(name, module) {
        this.#module = module;
        this.#id = `${module.id}//${name}`;

        const subpaths = config => this._subpaths(config);
        const conditional = (pexport, platform) => this._conditional(pexport, platform);
        const creator = {subpaths, conditional};

        this.#properties = new Properties(this);
        this.#exports = new Exports(this, creator);
    }

    #config;

    /**
     * Called by the module each time its configuration change
     *
     * @param config
     * @param multiplugin
     */
    configure(config, {multiplugin}) {
        if (equal(this.#config, config)) return;

        this.#properties.configure(config);
        this.#exports.configure(config);
    }

    /**
     * Set the subpaths exported by the plugin
     *
     * This method is actually a method of the Export class,
     * but it is here to simplify plugin implementation by avoiding having to create an Export class.
     *
     * @param config {*} The plugin configuration
     * @return {Map<string, *>} Return the map of subpaths with its configurations
     */
    _subpaths(config) {
        return new Map([[this.#properties.subpath, config]]);
    }

    /**
     * Creates a conditional according of the required platform
     *
     * This method is actually a method of the Export class,
     * but it is here to simplify plugin implementation by avoiding having to create an Export class.
     *
     * @param pexport {*}
     * @param platform {string}
     * @private
     */
    _conditional(pexport, platform) {
        void pexport;
        void platform;
        throw new Error('This method must be overridden by the plugin implementation');
    }

    destroy() {
        super.destroy();
        this.#exports.destroy();
        this.#properties.destroy();
    }
}
