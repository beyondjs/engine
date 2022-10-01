const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'dependencies.seeker';
    }

    #application;
    get application() {
        return this.#application;
    }

    #distribution;

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    // Is it a node internal module?
    #node;
    get node() {
        return this.#node;
    }

    // A special kind of bundle that is dynamically created by the engine
    // Actually only `${pkg}/config' is a reserved bundle
    #reserved;
    get reserved() {
        return this.#reserved;
    }

    // Is it a beyond internal bundle? Actually beyond_context
    #internal;
    get internal() {
        return this.#internal;
    }

    // The bundle object when it is found in the application project or a library
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    // When it is an external package
    #external;
    get external() {
        return this.#external;
    }

    get version() {
        if (!this.#bundle && !this.#external) return;

        if (this.#bundle) return this.#bundle.version;
        if (this.#external) return this.#external.version;
    }

    /**
     * Dependency seeker constructor
     *
     * @param application {object} The application object
     * @param specifier {string} The dependency specifier
     * @param distribution {object} The distribution specification
     */
    constructor(application, specifier, distribution) {
        if (!application || !specifier || !distribution) throw new Error('Invalid parameters');

        super();
        this.#application = application;
        this.#specifier = specifier;
        this.#distribution = distribution;

        // The application bundles
        super.setup(new Map([
            ['libraries', {child: application.libraries}],
            ['bundles', {child: application.modules.bundles}]
        ]));
    }

    _process() {
        // Just as a performance improvement, if it is a node internal module dependency, then
        // it will never change
        if (this.#node) return false;

        if (this.#specifier === 'beyond_context') {
            this.#internal = true;
            return;
        }

        const done = ({node, external, bundle, errors}) => {
            errors = errors ? errors : [];

            // Returning false makes the dynamic processor not to emit the change event
            if (external === this.#external && this.node === node &&
                bundle === this.#bundle && equal(this.#errors, errors)) return false;

            this.#node = !!node;
            this.#external = external;
            this.#bundle = bundle;
            this.#errors = errors;
        }

        const split = this.#specifier.split('/');
        if (split.length === 1) {
            // Check if it is a node internal module
            try {
                const resolved = require.resolve(this.#specifier);
                if (resolved === this.#specifier) return done({node: true});
            }
            catch (exc) {
                void (exc);
            }
        }

        const {pkg, version, subpath, errors} = require('./specifier-parser')(this.#specifier);
        if (errors) return done({errors});

        // Check if bundle specifier is contained in a module of the project or one of its libraries
        const libraries = this.children.get('libraries').child;
        if (pkg === this.#application.package || libraries.has(pkg)) {
            if (subpath === 'config') {
                this.#reserved = 'config';
                return;
            }

            const bundles = this.children.get('bundles').child;
            const {platform} = this.#distribution;

            const key = `${this.#specifier}//${platform}`;
            if (!bundles.has(key)) {
                const error = bundles.specifiers.has(this.#specifier) ?
                    `Bundle "${this.#specifier}" does not support the "${platform}" platform` :
                    `Dependency "${this.#specifier}" not found`;

                return done({errors: [error]});
            }

            const bundle = bundles.get(key);
            return done({bundle});
        }

        // Check if the specifier is an external resource
        const external = new (require('./external'))(pkg, version, subpath, this.#application);
        return done(external.error ? {errors: [external.error]} : {external});
    }

    destroy() {
        super.destroy();
    }
}
