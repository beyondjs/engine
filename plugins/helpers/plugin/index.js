const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const {Bundle: BundleBase} = require('beyond/plugins/helpers');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'plugin';
    }

    #plugin;
    get plugin() {
        return this.#plugin;
    }

    #id;
    get id() {
        return this.#id;
    }

    #config;
    get config() {
        return this.#config;
    }

    _outputs;

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'plugins-bundles'
        });
    }

    constructor(plugin) {
        super();
        this.#plugin = plugin;
        this.#id = plugin.id;
        this._outputs = new PluginOutputs(this);
    }

    /**
     * Bundles collection is not ready until its configuration is set
     * @return {boolean}
     * @private
     */
    _prepared() {
        return !!this.#config;
    }

    configure(config) {
        this.#config = new Map(Object.entries(config));
        this._invalidate();
    }

    clear() {
        this.forEach(bundle => bundle.destroy());
        super.clear();
    }

    destroy() {
        this.clear();
        super.destroy();
    }
}
