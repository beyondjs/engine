const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * The Dependency object required by:
 *   . The processors (actually it is being used by the "ts" and "sass" processors)
 *   . The dependencies collection of the Bundle and Transversal objects
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.dependency';
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #container;
    #propagator;

    get id() {
        return `${this.#container.id}//dependency//${this.specifier}`;
    }

    get distribution() {
        return this.#container.distribution;
    }

    get language() {
        return this.#container.language;
    }

    get seeker() {
        return this.children.get('seeker').child;
    }

    get errors() {
        return this.seeker.errors;
    }

    get valid() {
        return !this.errors.length;
    }

    // A special kind of bundle that is dynamically created by the engine
    // Actually only `${pkg}/config' is a reserved bundle
    get reserved() {
        return this.seeker.reserved;
    }

    // true if dependency is a beyond internal bundle. Actually 'beyond_context'
    get internal() {
        return this.seeker.internal;
    }

    // true if dependency is a node internal module
    get node() {
        return this.seeker.node;
    }

    get external() {
        return this.seeker.external;
    }

    get bundle() {
        return this.seeker.bundle;
    }

    get version() {
        return this.seeker.version;
    }

    get kind() {
        if (!this.processed) {
            Error.stackTraceLimit = 40;
            throw new Error('Processor is not ready');
        }

        if (!this.seeker.valid) return;
        if (this.reserved) return 'beyond.reserved';
        if (this.internal) return 'beyond.internal';
        if (this.node) return 'node.internal';
        if (this.external) return 'external';

        const {bundle} = this.seeker;
        const transversal = !!global.bundles.get(bundle.type).transversal;
        return transversal ? 'transversal' : 'bundle';
    }

    // What kind of dependency it is ('import' | 'type' | 'reference', 'css.import')
    #is = new Set();
    get is() {
        return this.#is;
    }

    // The sources that depend on this dependency
    #sources = new Map();
    get sources() {
        return this.#sources;
    }

    /**
     * Processor dependency constructor
     *
     * @param specifier {string} The dependency specifier
     * @param container {{application: object, distribution: object, language: string}}
     * @param Propagator? {object}
     */
    constructor(specifier, container, Propagator) {
        super();
        this.#specifier = specifier;
        this.#container = container;

        const {application, distribution} = container;
        const seeker = application.modules.seekers.create(specifier, distribution);
        super.setup(new Map([['seeker', {child: seeker}]]));

        this.#propagator = Propagator ? new Propagator(this._events) : void 0;
        this.#propagator?.subscribe(this);
    }

    clear() {
        this.#is.clear();
        this.#sources.clear();
    }

    hydrate(cached) {
        this.#is = new Set(cached.is);
        this.#sources = new Map(cached.sources);
    }

    toJSON() {
        return {is: [...this.#is], sources: [...this.#sources]};
    }

    destroy() {
        this.children.get('seeker').child.destroy();
        super.destroy();
        this.#propagator?.unsubscribe(this);
    }
}
