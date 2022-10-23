const DynamicProcessor = require('beyond/utils/dynamic-processor');
const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.dependency';
    }

    #specifier;
    /**
     * The parsed specifier
     * @return {SpecifierParser}
     */
    get specifier() {
        return this.#specifier;
    }

    #importer;
    get importer() {
        return this.#importer;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #vspecifier;
    /**
     * The vspecifier resolved according to the dependencies tree
     * @return {string}
     */
    get vspecifier() {
        return this.#vspecifier;
    }

    #bundle;
    /**
     * If found, the bundle that meets the specifier
     * @return {*}
     */
    get bundle() {
        return this.#bundle;
    }

    #kind;
    /**
     * Can be 'beyond.reserved', 'beyond.internal', 'node.internal'
     * 'beyond.reserved' is actually only used by the package configuration bundle `${pkg}/config'
     * 'beyond.internal' is actually only used by 'beyond_context'
     * @return {string}
     */
    get kind() {
        return this.#kind;
    }

    #is = new Set();
    /**
     * What kind of dependency it is ('import' | 'type' | 'reference', 'css.import')
     * @return {Set<any>}
     */
    get is() {
        return this.#is;
    }

    #sources = new Map();
    /**
     * The sources that depend on this dependency
     * @return {Map<string, Source>}
     */
    get sources() {
        return this.#sources;
    }

    /**
     * Dependency constructor
     *
     * @param specifier {string} The specifier being imported
     * @param importer {string} The vspecifier of the package from where the specifier is being imported
     * @param platform {string}
     */
    constructor(specifier, importer, platform) {
        if (typeof specifier !== 'string' || typeof importer !== 'string' || typeof platform !== 'string') {
            throw new Error('Invalid parameters');
        }

        super();
        this.#specifier = new SpecifierParser(specifier);
        this.#importer = importer;
        this.#platform = platform;

        super.setup(new Map([['packages', {child: packages}]]));
    }

    /**
     * The vspecifier is resolved in the prepare phase
     *
     * @param require
     * @private
     */
    _prepared(require) {
        this.#vspecifier = (() => {
            if (this.#specifier.pkg === this.#importer.split('@')[0]) return this.#importer;

            /**
             * Get the list of dependencies of the package from where the specifier is being imported
             */
            const pkg = packages.find({vspecifier: this.#importer});
            if (!pkg) return;
            const {dependencies} = pkg;
            if (!require(dependencies) || !dependencies.filled) return;

            /**
             * Get the package of the specifier from the dependencies of the importer
             */
            if (!dependencies.has(this.#specifier.pkg)) return;
            const {version} = dependencies.get(this.#specifier.pkg);
            this.#vspecifier = `${this.#specifier.pkg}@${version}`;
        })();
        if (!this.#vspecifier) return;

        const pkg = packages.find({vspecifier: this.#vspecifier});
        require(pkg.exports);
    }

    _process() {
        this.#bundle = this.#kind = void 0;

        /**
         * Property this.#vspecifier is resolved in the _prepared phase
         * If it is undefined, it means that the dependency cannot be solved
         */
        if (!this.#vspecifier) return;
        const pkg = packages.find({vspecifier: this.#vspecifier});
        if (!pkg) return;

        this.#bundle = (() => {
            // The vspecifier of the bundle being required
            const {subpath} = this.#specifier;
            const vspecifier = this.#vspecifier + (subpath !== '.' ? `/${subpath}` : '');
            return pkg.exports.get(vspecifier);
        })();
    }
}
