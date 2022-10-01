const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * All the packagers of the modules and libraries of the application for the distribution and language
 * of the transversal code packager
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.transversal.packagers';
    }

    // The transversal packager
    #tp;
    #propagator;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #code;
    get code() {
        return this.#code;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    async _begin() {
        await this.#tp.ready;
    }

    /**
     * Containers constructor
     *
     * @param tp {object} The transversal packager
     */
    constructor(tp) {
        super();
        this.#tp = tp;
        const {libraries, modules} = tp.transversal.application;
        super.setup(new Map([['libraries', {child: libraries}], ['modules', {child: modules}]]));

        this.#propagator = new (require('./propagator'))(this._events);
        this.#hash = new (require('./hash'))(this);
        this.#code = new (require('./code'))(this.#tp, this);
    }

    /**
     * Check if the dynamic processor is prepared or not
     *
     * @param collection {object} Can be a collection of libraries or a collection of application modules
     * @param require {function}
     */
    #prepared(collection, require) {
        const {transversal, distribution, language} = this.#tp;
        const {name} = transversal;

        collection.forEach(container => {
            const {bundles, id} = container;
            if (!require(container, id) || !require(bundles, id)) return;

            if (!bundles.has(name)) return;
            const packager = bundles.get(name).packagers.get(distribution, language);
            require(packager, packager.id);
        });
    }

    _prepared(require) {
        this.#prepared(this.children.get('libraries').child, require);
        this.#prepared(this.children.get('modules').child, require);
    }

    /**
     * Create the map of packagers
     *
     * @param collection {object} Can be a collection of libraries or a collection of application modules
     * @param updated {Map} The collection of packagers that are being processed
     * @param errors {Array} The array of errors
     */
    #process(collection, updated, errors) {
        const {transversal, distribution, language} = this.#tp;
        const {platform} = distribution;
        const {platforms} = global;
        const {name} = transversal;

        collection.forEach(container => {
            if (!container.bundles.has(name)) return;
            const bundle = container.bundles.get(name);

            // Check if the packager have to be excluded because
            // the distribution platform is not reached by the module where the bundle is contained
            if (bundle.container.is === 'application.module' && !bundle.container.platforms.has(platform)) return;

            // If the container is a library, the start bundles should not be included in node projects
            if (bundle.container.is === 'library' &&
                bundle.type === 'start' && platforms.nodeExceptSSR.includes(platform)) return;

            if (!bundle.valid) {
                errors.push(`Bundle "${bundle.pathname}" has reported errors`);
                return;
            }
            const packager = bundle.packagers.get(distribution, language);
            !bundle.processed && console.log(bundle.id, 'is not processed');
            updated.set(bundle.path, packager);
        });
    }

    _process() {
        const errors = [];
        const updated = new Map();
        this.#process(this.children.get('libraries').child, updated, errors);
        this.#process(this.children.get('modules').child, updated, errors);

        this.#errors = errors;

        // Subscribe modules that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(({bundle}) => !this.has(bundle.path)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(({bundle}) => !updated.has(bundle.path)));

        // Set the updated data into the collection
        super.clear();
        updated.forEach((value, key) => this.set(key, value));
    }
}
