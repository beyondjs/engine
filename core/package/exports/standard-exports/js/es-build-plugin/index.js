const {join, sep} = require('path');
const fs = require('fs').promises;
const Resolver = require('./resolver');

module.exports = class {
    #targetedExport;
    get targetedExport() {
        return this.#targetedExport;
    }

    // The plugin name
    get name() {
        return 'beyond-standard-export';
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
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

    #externals = new Map();
    get externals() {
        return this.#externals;
    }

    constructor(targetedExport) {
        this.#targetedExport = targetedExport;
        this.#platform = targetedExport.platform;

        this.#pkg = this.#targetedExport.pkg;
        this.#subpath = this.#targetedExport.packageExport.subpath;

        this.#specifier = this.#pkg.specifier;
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
        if (resolver.external) {
            const {specifier, kind} = resolver;
            const external = this.#externals.has(specifier) ? this.#externals.get(specifier) : new Set();
            external.add(kind);
            this.#externals.set(specifier, external);

            return kind === 'require-call' ?
                {namespace: `beyond_external:${resolver.specifier}`, path: '.'} :
                {external: true};
        }

        const {namespace, path} = resolver;
        return {namespace, path};
    }

    async #load(args) {
        if (this.#cancelled) throw new Error('Build was cancelled');

        const {path, namespace} = args;

        /**
         *
         */
        if (namespace.startsWith('beyond_external:')) {
            const specifier = namespace.slice('beyond_external:'.length);
            const contents = `module.exports = __beyond_resolve_external('${specifier}');\n`;
            return {contents};
        }

        if (!namespace.startsWith('beyond:')) throw new Error('Namespace should start with "beyond:"');

        // Do not import at the beginning of the file to avoid cyclical import
        const packages = require('beyond/packages');

        const vspecifier = namespace.slice('beyond:'.length);
        const pkg = packages.find({vspecifier});
        if (!pkg) throw new Error(`Package "${vspecifier}" not found`);

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
