const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The application modules (AM) of all the libraries
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.libraries.modules';
    }

    #propagator;

    /**
     * Collection of libraries modules constructor
     *
     * @param libraries {object} The application libraries collection
     */
    constructor(libraries) {
        super();
        this.#propagator = new (require('./propagator'))(this._events);
        super.setup(new Map([['libraries', {child: libraries}]]));
    }

    _prepared(require) {
        const libraries = this.children.get('libraries').child;
        libraries.forEach(library => require(library.modules));
    }

    _process() {
        const libraries = this.children.get('libraries').child;

        const updated = new Map();
        libraries.forEach(library => library.modules.forEach(module => updated.set(module.id, module)));

        // Subscribe modules that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(module => !this.has(module.id)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(module => !updated.has(module.id)));

        // Set the processed collection
        super.clear(); // Do not use this.clear() as it would unsubscribe reused modules
        updated.forEach((value, key) => this.set(key, value));
    }

    clear() {
        this.#propagator.unsubscribe([...this.values()]);
        super.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
