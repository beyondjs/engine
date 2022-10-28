const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const Export = require('./export');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'plugin';
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
        return module.subpath + (multiplugin ? `.${attributes.name}` : '');
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

    /**
     * Set the subpaths exported by the plugin
     * @param subpaths {Map<string, *>}
     */
    subpaths(subpaths) {
        subpaths.set(this.subpath, {});
    }

    conditional(pexport) {
        void pexport;
        throw new Error('This method must be overridden by the plugin implementation');
    }

    _process() {
        const subpaths = new Map();
        this.subpaths(subpaths);

        const updated = new Map();
        subpaths.forEach((data, subpath) => {
            subpath = subpath.startsWith('./') ? subpath : `./${subpath}`;

            const pexport = (() => {
                if (this.#exports.has(subpath)) return this.#exports.get(subpath);
                data = data ? data : {};
                return new Export(this, subpath, data);
            })();
            updated.set(subpath, pexport);
        });

        this.#exports.forEach((pexport, subpath) => !updated.has(subpath) && pexport.destroy());
        this.#exports.clear();
        updated.forEach((value, key) => this.#exports.set(key, value));
    }

    destroy() {
        this.#exports.forEach(subpath => subpath.destroy());
        super.destroy();
    }
}
