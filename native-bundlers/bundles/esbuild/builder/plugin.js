const packages = require('beyond/packages');
const {join, dirname, sep} = require('path');
const fs = require('fs').promises;
const Dependency = require('./dependency');

module.exports = class {
    #bundle;
    #platform;

    get name() {
        return 'beyond';
    }

    constructor(bundle, platform) {
        this.#bundle = bundle;
        this.#platform = platform;
    }

    #canceled = false;

    cancel() {
        this.#canceled = true;
    }

    #resolve(args) {
        if (this.#canceled) throw new Error('Build was canceled');

        const building = (() => {
            const {vspecifier} = this.#bundle.module.pkg;
            return {namespace: `beyond:${vspecifier}`, vspecifier, subpath: this.#bundle.subpath};
        })();
        const {kind, importer} = args;

        const {namespace, resource} = (() => {
            /**
             * The entry point
             */
            if (kind === 'entry-point') {
                return {namespace: building.namespace, resource: building.subpath};
            }

            /**
             * A relative internal module
             */
            if (args.path.startsWith('./')) {
                let resource = './' + join(dirname(importer), args.path);
                resource = sep !== '/' ? resource.replace(/\\/g, '/') : resource;
                return {namespace: args.namespace, resource};
            }

            /**
             * It is a non-relative specifier, so find the dependency
             */
            const {dependencies} = this.#bundle.module.pkg;
            const dependency = new Dependency(args.path, args.namespace.slice('beyond:'.length), dependencies);
            return {namespace: `beyond:${dependency.vspecifier}`, resource: dependency.resource};
        })();

        // Log the resolution processed arguments
        // console.log(
        //     `"${kind === 'entry-point' ? 'entry point' : importer}"`.bold.yellow +
        //     ' imports ' + `"${resource}"`.bold.yellow + '\n' +
        //     `\t* namespace: "${namespace}"\n` +
        //     `\t* kind: "${kind}"\n`);

        const vspecifier = namespace.slice('beyond:'.length);

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
