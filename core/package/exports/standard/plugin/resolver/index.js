const packages = require('beyond/packages');
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

    #orphan;
    /**
     * When the specifier being imported is a file of another package where the resource is not a subpath
     * @return {boolean}
     */
    get orphan() {
        return this.#orphan;
    }

    constructor(plugin, args) {
        this.#plugin = plugin;
        this.#specifier = args.path;
        const kind = this.#kind = args.kind;
        const importer = this.#importer = new Importer(args);

        const done = ({vspecifier, subpath, path}) => {
            this.#vspecifier = vspecifier;

            const pkg = this.#pkg = (() => {
                if (!packages.has(vspecifier)) {
                    const by = `file "${importer.path}" of package "${importer.vspecifier}"`;
                    throw new Error(`Package "${vspecifier}" not found, imported by ${by}`);
                }
                return packages.get(vspecifier);
            })();

            this.#path = (() => {
                if (path) return path;
                if (!pkg.exports.has(subpath)) {
                    this.#orphan = true;
                    return subpath;
                }
            })();
        }

        /**
         * The entry point
         */
        if (kind === 'entry-point') {
            const {vspecifier, subpath} = plugin;
            return done({vspecifier, subpath});
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
