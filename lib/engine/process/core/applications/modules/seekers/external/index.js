const DynamicProcessor = global.utils.DynamicProcessor();
const packages = require('uimport/packages');
const {platforms} = global;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'dependencies.external';
    }

    #application;
    get application() {
        return this.#application;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #version;
    get version() {
        return this.#version ? this.#version : this.#pkg.json.version;
    }

    /**
     * How the external is imported/required, in node environment the version is not specified
     * as nodejs resolves the resources from the node_modules folder, otherwise the version must be specified
     * @param distribution {any} The distribution specification
     * @return {string|*}
     */
    resource(distribution) {
        if (!this.processed) throw new Error('Object not processed');
        if (this.#pkg.error) return '';

        const {platform} = distribution;
        const subpath = this.#subpath ? `/${this.#subpath}` : '';
        return distribution.npm || platforms.node.includes(platform) ?
               this.#pkg.name + subpath :
               this.#pkg.name + `@${this.version}` + subpath;
    }

    /**
     * The url of the resource. This is actually required to process the import maps in esm mode
     *
     * @param distribution {any} The distribution specification
     * @return {string}
     */
    pathname(distribution) {
        if (!this.processed) throw new Error('Object not processed');
        if (this.#pkg.error) return '';

        const baseDir = distribution.baseDir ? distribution.baseDir : '/';
        const resource = this.resource(distribution);

        return `${baseDir}packages/${resource}`;
    }

    #error;
    get error() {
        return this.#error || this.#pkg.error;
    }

    get name() {
        return this.#pkg.name;
    }

    get path() {
        return this.#pkg.path;
    }

    get subpaths() {
        return this.#pkg.subpaths;
    }

    get json() {
        return this.#pkg.json;
    }

    #processed = false;

    _prepared() {
        return this.#processed;
    }

    /**
     * External package finder constructor
     * @param pkg {string} The package name
     * @param version {string} The package version
     * @param subpath {string} The subpath defined in the exports configuration property
     * @param application {object} The application object
     */
    constructor(pkg, version, subpath, application) {
        super();
        this.#application = application;
        this.#pkg = packages.get(pkg, {cwd: application.path});
        this.#dependencies = new (require('./dependencies'))(this);
        this.#version = version;
        this.#subpath = subpath;

        const done = () => (this.#processed = true) && this._invalidate();
        this.#pkg.process()
            .then(done)
            .catch((exc) => {
                this.#error = `Error processing package: ${exc.message}`;
                console.error(exc.stack);
                done();
            });
    }
}