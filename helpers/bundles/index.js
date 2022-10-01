const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * Bundles collection used by application module (AM) and application library (AL)
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundles';
    }

    // The application module or application library
    #container;
    get container() {
        return this.#container;
    }

    get id() {
        return this.#container.id;
    }

    #propagator;

    _notify() {
        if (this.#container.is === 'library') return;

        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'applications-modules',
            id: this.#container.id
        });
    }

    /**
     * The bundles collection
     *
     * @param container {object} The application module or application library
     */
    constructor(container) {
        super();
        this.#container = container;

        // Each child bundle binds the bundle collection (currently to check if the module has a txt bundle).
        // Consider that it is multiplied by the number of distributions.
        this.setMaxListeners(100);

        const children = [['global.bundles', {child: global.bundles}]];

        // If the container is an application.library, bundles are actually supported only if they are legacy
        // (not imported projects)
        const config = container[container.is === 'application.module' ? 'module' : 'library']?.bundles;
        config && children.push(['config', {child: config}]);
        super.setup(new Map(children));

        this.#propagator = new (require('./propagator'))(this._events);
    }

    _prepared(require) {
        const {children} = this;
        const container = this.#container;
        const config = container[container.is === 'application.module' ? 'module' : 'library']?.bundles;

        if (children.has('config')) {
            if (config === children.get('config').child) return;
            children.unregister(['config']);
        }
        if (!config) return;

        children.register(new Map([['config', {child: config}]]));
        require(config);
    }

    _process() {
        const {children} = this;
        const config = children.has('config') ? children.get('config').child : void 0;

        const updated = new Map();
        let changed = false;
        config?.forEach((config, name) => {
            let bundle = this.has(name) && this.get(name);
            if (!bundle) {
                const meta = global.bundles.get(name);
                const Bundle = meta.bundle?.Bundle ? meta.bundle.Bundle : require('../bundle');
                bundle = new Bundle(this.#container, name, config);
                changed = true;
            }
            updated.set(name, bundle);
        });

        if (!changed && this.size === updated.size) return false;

        // Subscribe modules that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(bundle => !this.has(bundle.type)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(bundle => !updated.has(bundle.type)));

        // Destroy unused bundles
        this.forEach((bundle, name) => !updated.has(name) && (changed = true) && bundle.destroy());

        super.clear(); // Do not use this.clear as it would destroy still used bundles
        updated.forEach((value, key) => this.set(key, value));
    }

    clear() {
        this.forEach(bundle => bundle.destroy());
        super.clear();
    }
}
