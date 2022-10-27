const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {plugins: registry} = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor(Map) {
    #module;

    #id;
    get id() {
        return this.#id;
    }

    #config;
    get config() {
        return this.#config;
    }

    constructor(module) {
        super();
        this.#module = module;
        this.#id = module.id;

        super.setup(new Map([['registry', {child: registry}]]));
    }

    /**
     * Plugins processor is not ready to process until its configuration is set
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

    _process() {
        const config = this.#config;

        const updated = new Map();
        let changed = false;
        config.forEach((config, name) => {
            if (!registry.has(name)) return;

            let plugin = this.has(name) && this.get(name);
            if (!plugin) {
                const Plugin = registry.get(name);
                plugin = new Plugin(this.#module);
                changed = true;
            }
            updated.set(name, plugin);
            plugin.configure(config);
        });

        if (!changed && this.size === updated.size) return false;

        // Destroy unused registry
        this.forEach((plugin, name) => !updated.has(name) && (changed = true) && plugin.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    }

    destroy() {
        this.forEach(plugin => plugin.destroy());
        super.destroy();
    }
}
