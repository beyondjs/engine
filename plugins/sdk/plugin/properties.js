const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'plugin.properties';
    }

    #plugin;
    #config;

    #multiplugin;
    /**
     * Does the plugin container contain more than one plugin?
     * @return {boolean}
     */
    get multiplugin() {
        return this.#multiplugin;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    constructor(plugin) {
        super();
        this.#plugin = plugin;
    }

    _prepared() {
        return !!this.#config;
    }

    _process() {
        const {attributes, multiplugin, module} = this.#plugin;
        const subpath = module.subpath + (multiplugin ? `.${attributes.name}` : '');

        const changed = subpath !== this.#subpath;
        this.#subpath = subpath;
        return changed;
    }

    configure(config, multiplugin) {
        this.#config = config;
        this.#multiplugin = multiplugin;
        this._invalidate();
    }
}
