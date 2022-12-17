const qs = require('querystring');
const {platforms} = global;

module.exports = class {
    #application;
    get application() {
        return this.#application;
    }

    #pathname;
    get pathname() {
        return this.#pathname;
    }

    #query;
    get query() {
        return this.#query;
    }

    #found = false;
    get found() {
        return this.#found;
    }

    // Can be 'bundle' or 'transversal'
    #is;
    get is() {
        return this.#is;
    }

    #qs;

    #hmr;
    get hmr() {
        return this.#hmr;
    }

    #info;
    get info() {
        return this.#info;
    }

    #bridges;
    get bridges() {
        return this.#bridges;
    }

    #extname;
    get extname() {
        return this.#extname;
    }

    #map;
    get map() {
        return this.#map;
    }

    #language;
    get language() {
        return this.#language;
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    // Is it a bundle contained in a package that is not the current project
    #foreign;
    get foreign() {
        return this.#foreign;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    /**
     * Pathname parser constructor
     *
     * @param application {object} The application object
     * @param pathname {string} The pathname
     * @param query {string} The querystring
     */
    constructor(application, pathname, query) {
        this.#application = application;
        this.#pathname = pathname;
        this.#query = query;
    }

    async process(distribution) {
        const application = this.#application;

        let pathname = this.#pathname;
        this.#map = pathname.endsWith('.map');
        pathname = this.#map ? pathname.slice(0, pathname.length - 4) : pathname;

        this.#qs = qs.parse(this.#query);
        this.#hmr = this.#qs.hmr !== void 0;
        this.#info = this.#qs.info !== void 0;
        this.#bridges = this.#qs.bridges !== void 0;

        const extname = this.#extname = (() => {
            const dts = pathname.endsWith('.d.ts') ? '.d.ts' : void 0;
            return dts ? dts : require('path').extname(pathname);
        })();

        const split = pathname.substr(1, pathname.length - 1 - extname.length).split('/');

        // If the resource do not starts with '/packages', then it is a bundle contained in the application package
        // Otherwise it should be a foreign bundle
        if (split[0] === 'packages') {
            this.#foreign = true;
            split.shift(); // Remove the 'packages' entry

            const {pkg, version, error} = (() => {
                const scope = split[0].startsWith('@') ? split.shift() : void 0;
                const [name, version] = split.shift().split('@');

                const node = platforms.node.includes(distribution.platform);
                if (!node && !version) {
                    return {error: 'Package version must be specified'};
                }

                const pkg = scope ? `${scope}/${name}` : name;
                return {pkg, version};
            })();
            if (error) {
                this.#error = error;
                return;
            }
            if (!pkg) return;

            this.#pkg = pkg;
            this.#version = version;

            // It should be a bundle of the application or a bundle of one of the application's libraries
            if (this.#pkg === application.package) {
                this.#error = `The package being requested is the current project "${this.#pkg}"`;
                return;
            }

            if (!application.libraries.has(this.#pkg)) {
                // It is not a bundle from an imported project, but it still can be an external bundle
                return;
            }

            const library = application.libraries.get(this.#pkg);
            await library.ready;
            if (version && library.version !== this.#version) {
                this.#error = `Version "${this.#version}" differs from the registered version of the dependency "${library.version}"`;
                return;
            }
        }
        else {
            this.#foreign = false;
            this.#pkg = application.package;
        }
        if (!split.length) return;

        // unknown can have the language and or the name of the bundle
        const [filename, ...unknown] = split.pop().split('.');
        if (unknown.length > 2) return;

        // Check if resource is a transversal bundle
        const transversal = await (async () => {
            if (split.length) return; // It cannot be a transversal bundle

            await global.bundles.ready;
            if (!global.bundles.has(filename)) return;
            const specs = global.bundles.get(filename);

            if (!specs.transversal) return;

            // unknown should only have the language
            if (unknown.length > 1) return;

            const {transversals} = application;
            if (!transversals.has(filename)) return;
            if (specs.multilanguage && !unknown.length) return;

            this.#found = true;
            this.#is = 'transversal';
            this.#bundle = transversals.get(filename);
            this.#language = unknown.length ? unknown[0] : void 0;
        })();
        if (transversal) return;

        // Check if the resource is a module
        const {modules} = application;
        await modules.ready;

        const subpath = split.length ? `${split.join('/')}/${filename}` : filename;
        const specifier = `${this.#pkg}/${subpath}`;

        const {platform} = distribution;
        const key = `${specifier}//${platform}`;
        if (!modules.platforms.has(key)) {
            if (modules.specifiers.has(specifier)) {
                this.#error = `Module "${specifier}" does not support "${platform}" platform`;
            }
            return;
        }
        const module = modules.platforms.get(key);

        // At this point, alternatives of unknown are, expressed with examples:
        // home.js => [] a module with only one bundle that is not multilanguage
        // home.en.js => ['en'] home only has a txt bundle, then 'en' is the language
        // home.txt.js => ['txt'] home has more than one bundle, and it is not multilanguage, then 'txt' is the bundle
        // home.txt.en.js => ['txt', 'en'] home has more than one bundle, and it is not multilanguage, then 'txt' is the bundle
        await module.ready;
        await module.bundles.ready;
        if (!module.bundles.size) {
            this.#error = `Module "${module.specifier}" does not specify any bundle`;
            return;
        }

        const {bundle, language} = await (async () => {
            if (module.bundles.size === 1) {
                // Module has only one bundle, so unknown should be empty,
                // or only contain the language if the bundle is multilanguage
                if (unknown.length > 1) return {};

                const bundle = module.bundles.get([...module.bundles.keys()][0]);
                return {bundle, language: unknown[0]};
            }
            else {
                // unknown should at least specify the bundle name
                // and if the bundle is multilanguage, then it must specify the language too
                if (!unknown.length) return {};

                const name = unknown.shift();
                let bundle;

                // Find the bundle in the collection of bundles of the module
                for (const b of module.bundles.values()) {
                    await b.ready;
                    if (b.name === name) {
                        bundle = b;
                        break;
                    }
                }
                if (!bundle) return {};

                return {bundle, language: unknown[0]};
            }
        })();
        if (!bundle) return;

        await bundle.ready;
        if (!bundle.multilanguage && language) {
            this.#error = `Bundle is not multilanguage, but language "${language}" was set`;
            return;
        }
        if (bundle.multilanguage && !language) {
            this.#error = `Bundle is multilanguage, but language was not set`;
            return;
        }

        this.#found = true;
        this.#is = 'bundle';
        this.#bundle = bundle;
        this.#language = language;
    }
}
