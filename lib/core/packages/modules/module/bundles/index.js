const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const {bundles} = require('beyond/bundlers');
const {Bundle: BundleBase} = require('beyond/bundler-helpers');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundles';
    }

    #module;
    get module() {
        return this.#module;
    }

    get id() {
        return this.#module.id;
    }

    #config;
    get config() {
        return this.#config;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'applications-modules',
            id: this.#module.id
        });
    }

    constructor(module) {
        super();
        this.#module = module;
    }

    /**
     * Bundles collection is not ready until its configuration is set
     * @return {boolean}
     * @private
     */
    _prepared() {
        return !!this.#config;
    }

    _process() {
        const config = this.#config;

        const updated = new Map();
        let changed = false;
        config.forEach((config, type) => {
            let bundle = this.has(type) && this.get(type);
            if (!bundle) {
                const meta = bundles.get(type);
                const Bundle = meta.bundle?.Bundle ? meta.bundle.Bundle : BundleBase;
                bundle = new Bundle(this.#module, type);
                changed = true;
            }
            updated.set(type, bundle);
            bundle.configure(config);
        });

        if (!changed && this.size === updated.size) return false;

        // Destroy unused bundles
        this.forEach((bundle, type) => !updated.has(type) && (changed = true) && bundle.destroy());

        super.clear(); // Do not use this.clear as it would destroy still used bundles
        updated.forEach((value, key) => this.set(key, value));
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
