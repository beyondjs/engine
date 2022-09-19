/**
 * The collection of BeyondJS bundles imported by the application
 */
module.exports = class extends Map {
    #bee;
    #loader;

    #errors = new Map();
    #importing = new Map();

    get project() {
        return this.#bee.specs.project;
    }

    get package() {
        return this.#bee.specs.project.pkg;
    }

    #brequire;

    /**
     * Bundles collection constructor
     *
     * @param bee {object} The BEE object
     */
    constructor(bee) {
        super();
        this.#bee = bee;

        this.#loader = new (require('./loader'))(bee);

        require('./brequire/import')(this);
        this.#brequire = new (require('./brequire/require'))(this);
    }

    require(uri) {
        if (this.has(uri)) return {bundle: this.get(uri)};
        if (this.#errors.has(uri)) return {errors: this.#errors.get(uri)};
    }

    /**
     * Import a BeyondJS bundle
     *
     * @param uri {string} The bundle uri
     * @param version {number=} The version number to support HMR
     * @return {Promise<*|{bundle: *}|{errors: *}|*>}
     */
    async import(uri, version) {
        const required = !version && this.require(uri);
        if (required) return required;

        if (this.#importing.has(uri)) {
            return await this.#importing.get(uri).value;
        }

        const promise = Promise.pending();
        this.#importing.set(uri, promise);
        const loaded = await this.#loader.load(uri);

        const done = (output) => {
            output.errors && this.#errors.set(uri, output.errors);
            promise.resolve(output);
            this.#importing.delete(uri);
            return output;
        }

        let {errors} = loaded;
        if (errors) return done({errors});

        // Load the dependencies
        const promises = new Map();
        loaded.dependencies.forEach(({resource, kind}) => {
            if (!['bundle', 'transversal'].includes(kind)) return;
            // resource = kind === 'transversal' ? resource.split('/').pop() : resource;
            promises.set(resource, this.import(resource));
        });
        await Promise.all([...promises.values()]);

        // Check if any of the dependencies has been imported with errors
        // The dependencies can have errors related to the import of the dependency, or compilation exceptions
        const dependenciesErrors = [];
        for (const [resource, promise] of promises) {
            const {errors, bundle} = await promise;
            errors && dependenciesErrors.push(`Dependency "${resource}" has been imported with errors: ${errors}`);
            if (errors) continue;

            if (!bundle) dependenciesErrors.push(`Dependency "${resource}" not found`);
            if (bundle.exc) dependenciesErrors.push(`Dependency "${resource}" exception: ${bundle.exc.message}`);
            if (bundle.errors) dependenciesErrors.push(`Dependency "${resource}" has been imported with errors: ${bundle.errors}`);
        }

        // If the dependencies of the bundle has errors,
        // then the bundle has to be returned indicating its dependencies errors
        if (dependenciesErrors.length) return done({errors: dependenciesErrors});

        const {is, code, map} = loaded;
        const bundle = new (require('./bundle'))(this, this.#brequire, is, uri, code, map);
        this.set(uri, bundle);
        bundle.compile();

        return done({bundle});
    }
}
