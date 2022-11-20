const ipc = require('beyond/utils/ipc');
const Properties = require('./properties');
const PackageExports = require('./package-exports');
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

    #packageExports = new Map();
    get packageExports() {
        return this.#packageExports;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'plugins-packageExports'
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

        const defineSubpaths = config => this._defineSubpaths(config);
        const createTargetedExport = (packageExport, platform) => this._createTargetedExport(packageExport, platform);
        const creator = {defineSubpaths, createTargetedExport};

        this.#properties = new Properties(this);
        this.#packageExports = new PackageExports(this, creator);
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
        this.#packageExports.configure(config);
    }

    /**
     * Define the subpaths exported by the plugin
     *
     * This method is actually a method of the Export class,
     * but it is here to simplify plugin implementation by avoiding having to create an Export class.
     *
     * @param config {*} The plugin configuration
     * @return {Map<string, *>} Return the map of subpaths with its configurations
     */
    _defineSubpaths(config) {
        return new Map([[this.#properties.subpath, config]]);
    }

    /**
     * Creates a targeted export according of the required platform
     *
     * This method is actually a method of the Export class,
     * but it is here to simplify plugin implementation by avoiding having to create an Export class.
     *
     * @param packageExport {*}
     * @param platform {string}
     * @private
     */
    _createTargetedExport(packageExport, platform) {
        void packageExport;
        void platform;
        throw new Error('This method must be overridden by the plugin implementation');
    }

    destroy() {
        super.destroy();
        this.#packageExports.destroy();
        this.#properties.destroy();
    }
}
