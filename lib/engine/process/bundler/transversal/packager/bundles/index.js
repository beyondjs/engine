const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * All the packagers of the modules of the application for the distribution and language
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
        const {modules} = tp.transversal.application;
        super.setup(new Map([['modules', {child: modules}]]));

        this.#propagator = new (require('./propagator'))(this._events);
        this.#hash = new (require('./hash'))(this);
        this.#code = new (require('./code'))(this.#tp, this);
    }

    _prepared(require) {
        const {transversal, distribution, language} = this.#tp;
        const {name} = transversal;
        const modules = this.children.get('modules').child;

        modules.forEach(module => {
            const {bundles, id} = module;
            if (!require(module, id) || !require(bundles, id)) return;

            if (!bundles.has(name)) return;
            const packager = bundles.get(name).packagers.get(distribution, language);
            require(packager, packager.id);
        });
    }

    _process() {
        const {transversal, distribution, language} = this.#tp;
        const {platform} = distribution;
        const {platforms} = global;
        const {name} = transversal;
        const modules = this.children.get('modules').child;

        const errors = [];
        const updated = new Map();
        modules.forEach(module => {
            if (!module.bundles.has(name)) return;
            const bundle = module.bundles.get(name);

            // Validates that the traversal is contained in the package
            const {application} = this.#tp.transversal;
            if (module.container.id !== application.id) return;

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
