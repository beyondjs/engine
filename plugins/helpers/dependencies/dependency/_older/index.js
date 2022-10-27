const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {bundles} = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.dependency';
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #found;
    get found() {
        return this.#found;
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
        const transversal = !!bundles.get(bundle.type).transversal;
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
     * @param container {{pkg: object, cspecs: object, language: string}}
     */
    constructor(specifier, container,) {
        super();
        this.#specifier = specifier;
        this.#container = container;

        const {pkg, cspecs} = container;
        const seeker = pkg.modules.seekers.create(specifier, cspecs);
        super.setup(new Map([['seeker', {child: seeker}]]));
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
    }
}
