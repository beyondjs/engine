const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Bundle = require('./bundle');
const BundleWrapper = require('./wrapper');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export';
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    get is() {
        return 'standard';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    #config;
    #bundles = new Map();
    #wrappers = new Map();

    constructor(pkg, subpath) {
        super();
        this.#pkg = pkg;
        this.#subpath = subpath;
    }

    condition(platform) {
        if (this.#wrappers.has(platform)) return this.#wrappers.get(platform);

        const bundle = this.#bundles.get('default');

        const wrapper = new BundleWrapper(platform);
        this.#wrappers.set(platform, wrapper);
        wrapper.bundle = bundle;
        return wrapper;
    }

    _prepared() {
        return !!this.#config;
    }

    _process() {
        const config = (() => {
            const config = typeof this.#config === 'string' ? {default: this.#config} : this.#config;
            return new Map(Object.entries(config));
        })();

        const updated = new Map();
        let changed = false;

        config.forEach((entry, platform) => {
            const bundle = (() => {
                if (this.#bundles.has(platform)) return this.#bundles.get(platform);
                changed = true;
                return new Bundle(this, platform, entry);
            })();
            updated.set(platform, bundle);
        });

        // Destroy unused bundles
        this.#bundles.forEach((bundle, key) => !updated.has(key) && (changed = true) && bundle.destroy());
        this.#bundles.clear();
        updated.forEach((bundle, key) => this.#bundles.set(key, bundle));
    }

    configure(config) {
        this.#config = config ? config : {};
        this._invalidate();
    }

    destroy() {
        super.destroy();
        this.#wrappers.forEach(wrapper => wrapper.destroy());
        this.#bundles.forEach(bundle => bundle.destroy());
    }
}
