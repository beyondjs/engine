const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Bundle = require('./bundle');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'module.exported.bundles';
    }

    #module;
    #config;

    constructor(module) {
        super();
        this.#module = module;
    }

    _prepared() {
        return !!this.#config;
    }

    _process() {
        const updated = new Map();
        let changed = false;

        this.#config.forEach((conditional, name) => {
            const bundle = this.has(name) ? this.get(name) : (changed = true) && new Bundle(this.#module, name);
            updated.set(name, bundle);
            bundle.configure(conditional);
        });

        // Destroy unused modules
        this.forEach((bundle, name) => !updated.has(name) && (changed = true) && bundle.destroy());

        // Set the modules in the collection
        this.clear();
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    /**
     * Configure the bundles of the module
     *
     * @param config {Map<string, Conditional>}
     */
    configure(config) {
        this.#config = config;
        this._invalidate();
    }
}
