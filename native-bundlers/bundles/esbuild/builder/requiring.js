const {join, dirname, sep} = require('path');
const Dependency = require('./dependency');

/**
 * The data structure of the node of the graph being imported
 */
module.exports = class {
    #plugin;

    #vspecifier;
    /**
     * The resolved vspecifier of the specifier being imported according to the dependencies tree
     * @return {*}
     */
    get vspecifier() {
        return this.#vspecifier;
    }

    #namespace;
    /**
     * The namespace of the specifier being imported according to the dependencies tree
     * @return {string}
     */
    get namespace() {
        return this.#namespace;
    }

    #path;
    /**
     * The path of the file when it is a relative specifier, undefined for non-relative specifiers
     * @return {string}
     */
    get path() {
        return this.#path;
    }

    #subpath;
    /**
     * The subpath of the package of the specifier being imported when it is a non-relative specifier
     * undefined for relative specifiers
     * @return {string}
     */
    get subpath() {
        return this.#subpath;
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
        const importer = this.#importer = (() => {
            const {namespace} = args;
            const vspecifier = namespace?.slice('beyond:'.length);
            return {namespace, vspecifier, path: args.importer};
        })();

        /**
         * The entry point
         */
        if (kind === 'entry-point') {
            this.#vspecifier = plugin.vspecifier;
            this.#namespace = plugin.namespace;
            this.#subpath = plugin.subpath;
            return;
        }

        if (!args.namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        /**
         * A relative internal module
         */
        if (args.path.startsWith('./')) {
            this.#vspecifier = args.namespace.slice('beyond:'.length);
            this.#namespace = args.namespace;
            this.#path = (() => {
                const path = './' + join(dirname(importer.path), args.path);
                return sep !== '/' ? path.replace(/\\/g, '/') : path;
            })();
            return;
        }

        /**
         * It is a non-relative specifier, find the vspecifier according to the dependencies tree
         */
        const dependency = new Dependency(this.#plugin, args.path, importer);
        this.#vspecifier = dependency.vspecifier;
        this.#namespace = dependency.namespace;
        this.#subpath = dependency.subpath;
        return {namespace: `beyond:${dependency.vspecifier}`, resource: dependency.subpath};
    }
}
