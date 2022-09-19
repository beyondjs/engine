const DynamicProcessor = global.utils.DynamicProcessor(Map);
const {equal} = global.utils;

/**
 * The bundles of the module or project
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundles.config';
    }

    #container;

    #config;
    get config() {
        return this.#config;
    }

    #configured = false;
    get configured() {
        return this.#configured;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    /**
     * Bundles configuration constructor
     *
     * @param container {object} Can be a module or application (or library [legacy])
     */
    constructor(container) {
        if (!container) throw new Error('Invalid parameters');
        super();

        this.#container = container;
        super.setup(new Map([['global.bundles', {child: global.bundles}]]));
    }

    _prepared() {
        return this.#configured;
    }

    _process() {
        let changed = false;
        const warnings = [];
        const updated = new Map();
        [...Object.entries(this.#config)].forEach(([name, config]) => {
            if (!global.bundles.has(name)) {
                warnings.push(`Bundle "${name}" not found`);
                return;
            }

            const bundle = this.has(name) ? this.get(name) :
                (changed = true) && new (require('./bundle'))(name, this.#container);

            updated.set(name, bundle);
            bundle.configure(config);
        });

        // Destroy unused bundles
        this.forEach((bundle, name) => !updated.has(name) && (changed = true) && bundle.destroy());

        super.clear(); // Do not use this.clear as it would destroy bundles that are being used
        updated.forEach((value, key) => this.set(key, value));

        changed = changed || !equal(this.#warnings, warnings);
        this.#warnings = warnings;
        return changed;
    }

    configure(config) {
        if (this.#configured && equal(config, this.#config)) return;

        this.#config = config;
        this.#configured = true;
        this._invalidate();
    }

    clear() {
        this.forEach(bundle => bundle.destroy());
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
