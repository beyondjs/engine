const packages = require('beyond/packages');
const {join, sep} = require('path');
const fs = require('fs').promises;
const Dependency = require('./dependency');

module.exports = class {
    #bundle;

    // The plugin name
    get name() {
        return 'beyond';
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #namespace;
    get namespace() {
        return this.#namespace;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    constructor(bundle, platform) {
        this.#bundle = bundle;
        this.#platform = platform;
        this.#pkg = this.#bundle.module.pkg;
        this.#vspecifier = this.#pkg.vspecifier;
        this.#namespace = `beyond:${this.#vspecifier}`;
        this.#subpath = this.#bundle.subpath;
    }

    #canceled = false;

    cancel() {
        this.#canceled = true;
    }

    #resolve(args) {
        if (this.#canceled) throw new Error('Build was canceled');

        // The node of the graph being imported/required
        const Requiring = require('./requiring');
        const {namespace, resource} = new Requiring(this, args);

        // Log the resolution processed arguments
        console.log(
            `"${kind === 'entry-point' ? 'entry point' : importer}"`.bold.yellow +
            ' imports ' + `"${resource}"`.bold.yellow + '\n' +
            `\t* node.namespace: "${node.namespace}"\n` +
            `\t* node.kind: "${node.kind}"\n`);

        const {dependencies} = this.#bundle.module.pkg;
        const dependency = new Dependency(args.path, args.namespace.slice('beyond:'.length), dependencies);

        if (!dependency.pkg) throw new Error(`Package "${pkg}" not found`);

        /**
         * Check if we are resolving the resource being requested
         */
        if (namespace === building.namespace && resource === building.subpath) {
            const resolved = vpackage.exports.solve(resource, {platform: this.#platform, kind});
            if (!resolved) throw new Error(`Bundle "${building.vspecifier}" not found`);
            return {namespace, path: resolved};
        }

        /**
         * Check if it is an external resource
         */
        const found = vpackage.exports.solve(resource, {platform: 'web', kind});
        if (found) {
            return {external: true};
        }

        /**
         * If the path being requested is not an external bundle, then include it in the package
         */
        return {namespace, path: resource};
    }

    async #load(args) {
        if (this.#canceled) throw new Error('Build was canceled');

        const {path: resource, namespace} = args;

        if (!namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        const vspecifier = namespace.slice('beyond:'.length);
        if (!packages.has(vspecifier)) throw new Error(`Package "${vspecifier}" not found`);
        const dependency = packages.get(vspecifier);

        const file = (() => {
            const file = (() => {
                const file = join(download.path, resource);
                return sep !== '/' ? file.replace(/\\/g, '/') : file;
            })();

            // Package files can be overwritten when the platform is "browser"
            return vpackage.browser.has(file) ? vpackage.browser.get(file) : file;
        })();

        const contents = await fs.readFile(file, 'utf8');
        return {contents};
    }

    setup = build => {
        build.onResolve({filter: /./}, args => this.#resolve(args));
        build.onLoad({filter: /./}, async args => await this.#load(args));
    }
}
