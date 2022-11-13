const {join, dirname, sep} = require('path');
const Dependency = require('./dependency');
const Importer = require('./importer');

module.exports = class {
    #plugin;

    #specifier;
    /**
     * The specifier being imported, can be a relative or non-relative specifier
     * @return {string}
     */
    get specifier() {
        return this.#specifier;
    }

    #vspecifier;
    /**
     * The resolved vspecifier of the specifier being imported according to the dependencies tree
     * @return {*}
     */
    get vspecifier() {
        return this.#vspecifier;
    }

    /**
     * The namespace of the specifier being imported according to the dependencies tree
     * @return {string}
     */
    get namespace() {
        return `beyond:${this.#vspecifier}`;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #external;
    /**
     * Is it an external module (export of a package) that has not to be imported in the dependency graph
     * of the graph being built
     * @return {boolean}
     */
    get external() {
        return this.#external;
    }

    #orphan;
    /**
     * When the specifier being imported is from an external package, but the exports are not defined, or the specifier
     * does not comply any of the exports defined in it
     * @return {boolean}
     */
    get orphan() {
        return this.#orphan;
    }

    #path;
    /**
     * The absolute path of the file that resolves for the resource being imported
     * It is undefined if the specifier is an external module (export of a package)
     * @return {string}
     */
    get path() {
        return this.#path;
    }

    #importer;
    /**
     * The namespace and path that is importing the required specifier
     * @return {{namespace: string, vspecifier: string, path: string}}
     */
    get importer() {
        return this.#importer;
    }

    #kind;
    get kind() {
        return this.#kind;
    }

    constructor(plugin, args) {
        this.#plugin = plugin;
        const kind = this.#kind = args.kind;

        /**
         * The entry point
         */
        if (kind === 'entry-point') {
            this.#pkg = this.#plugin.pkg;
            this.#specifier = this.#plugin.specifier;
            this.#vspecifier = this.#plugin.vspecifier;
            this.#path = this.#plugin.bundle.entry;
            return;
        }

        this.#specifier = args.path;
        const importer = this.#importer = new Importer(args);

        const done = ({vspecifier, subpath, path}) => {
            this.#vspecifier = vspecifier;

            const pkg = this.#pkg = (() => {
                // Do not import at the beginning of the file to avoid cyclical import
                const packages = require('beyond/packages');

                const pkg = packages.find({vspecifier});
                if (!pkg) {
                    const by = kind !== 'entry-point' ?
                        `, imported by file "${importer.path}" of package "${importer.vspecifier}"` : '';
                    throw new Error(`Package "${vspecifier}" not found${by}`);
                }
                return pkg;
            })();

            this.#path = (() => {
                if (path) return path;
                if (!pkg.exports.has(subpath)) {
                    this.#orphan = true;
                    return subpath;
                }
                else {
                    this.#external = true;
                }
            })();
        }

        if (!args.namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        /**
         * A relative internal module
         */
        if (args.path.startsWith('./')) {
            const vspecifier = args.namespace.slice('beyond:'.length);
            const path = (() => {
                const path = './' + join(dirname(importer.path), args.path);
                return sep !== '/' ? path.replace(/\\/g, '/') : path;
            })();
            return done({vspecifier, path});
        }

        /**
         * It is a non-relative specifier, find the vspecifier according to the dependencies tree
         */
        const dependency = new Dependency(this.#plugin, args.path, importer);
        const vspecifier = dependency.vspecifier;
        const subpath = dependency.subpath;
        return done({vspecifier, subpath});
    }
}
