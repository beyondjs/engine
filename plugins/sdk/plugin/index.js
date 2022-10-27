const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const Export = require('./export');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'plugin';
    }

    static name() {
        throw new Error('This property must be overridden by the plugin implementation');
    }

    #module;
    get module() {
        return this.#module;
    }

    #id;
    get id() {
        return this.#id;
    }

    #config;
    get config() {
        return this.#config;
    }

    #multiplugin;
    get multiplugin() {
        return this.#multiplugin;
    }

    get subpath() {
        const {attributes, multiplugin, module} = this;
        return module.name + (multiplugin ? `.${attributes.name}` : '');
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
        super();
        this.#module = module;
        this.#id = `${name}/${module.id}`;
    }

    /**
     * Bundles collection is not ready until its configuration is set
     * @return {boolean}
     * @private
     */
    _prepared() {
        return !!this.#config;
    }

    configure(config, {multiplugin}) {
        this.#config = new Map(Object.entries(config));
        this.#multiplugin = multiplugin;
        this._invalidate();
    }

    clear() {
        this.forEach(bundle => bundle.destroy());
        super.clear();
    }

    /**
     * Set the subpaths exported by the plugin
     * @param subpaths {Map<string, *>}
     */
    exports(subpaths) {
        subpaths.set(this.subpath, {platforms: ['default']});
    }

    conditional(pexport) {
        void pexport;
        throw new Error('This method must be overridden by the plugin implementation');
    }

    _process() {
        this.clear();
        const subpaths = new Map();
        this.exports(subpaths);

        const updated = new Map();
        subpaths.forEach((data, subpath) => {
            const pexport = (() => {
                if (this.has(subpath)) return this.get(subpath);
                data = data ? data : {};
                return new Export(this, subpath, data);
            })();
            updated.set(subpath, pexport);
        });

        this.forEach((pexport, subpath) => !updated.has(subpath) && pexport.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    }

    destroy() {
        this.clear();
        super.destroy();
    }
}
