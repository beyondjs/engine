const {join, sep} = require('path');
const fs = require('fs').promises;
const Resolver = require('./resolver');

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

        this.#pkg = this.#bundle.pkg;
        this.#subpath = this.#bundle.pexport.subpath;

        this.#vspecifier = this.#pkg.vspecifier;
        this.#namespace = `beyond:${this.#vspecifier}`;
    }

    #cancelled = false;

    cancel() {
        this.#cancelled = true;
    }

    #resolve(args) {
        if (this.#cancelled) throw new Error('Build was cancelled');

        // The node of the graph being imported/required
        const resolver = new Resolver(this, args);

        /**
         * Check if we are resolving the resource being requested
         */
        if (resolver.kind === 'entry-point') {
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
         * If the path being requested is not a package export, then include it in the bundle
         */
        return {namespace, path: resource};
    }

    async #load(args) {
        if (this.#cancelled) throw new Error('Build was cancelled');

        const {path, namespace} = args;

        if (!namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        const vspecifier = namespace.slice('beyond:'.length);
        if (!packages.has(vspecifier)) throw new Error(`Package "${vspecifier}" not found`);
        const pkg = packages.get(vspecifier);

        /**
         * The absolute path of the file that resolves the node being imported/required
         * considering the overwrites that can be specified in the package.json (browser entry) when the platform
         * is browser
         * @type {string}
         */
        const file = (() => {
            // Package files can be overwritten when the platform is "browser"
            let file = sep !== '/' ? path.replace(/\\/g, '/') : path;
            file = this.#platform === 'browser' && pkg.browser.has(file) ? pkg.browser.get(file) : file;
            return join(pkg.path, file);
        })();

        const contents = await fs.readFile(file, 'utf8');
        return {contents};
    }

    setup = build => {
        build.onResolve({filter: /./}, args => this.#resolve(args));
        build.onLoad({filter: /./}, async args => await this.#load(args));
    }
}
