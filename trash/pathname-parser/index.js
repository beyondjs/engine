const qs = require('querystring');

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

    #extname;
    get extname() {
        return this.#extname;
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
        const pathname = this.#pathname;

        this.#qs = qs.parse(this.#query);
        this.#hmr = this.#qs.hmr !== void 0;
        this.#info = this.#qs.info !== void 0;

        const extname = this.#extname = (() => {
            const dts = pathname.endsWith('.d.ts') ? '.d.ts' : void 0;
            return dts ? dts : require('path').extname(pathname);
        })();

        const split = pathname.substr(1, pathname.length - 1 - extname.length).split('/');

        // If the resource do not starts with '/packages', then it is a bundle contained in the application package
        // Otherwise it should be a foreign bundle
        if (split[0] === 'packages') {
            split.shift(); // Remove the 'packages' entry
            this.#foreign = true;
            this.#pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
            if (!split.length) return;
        }
        else {
            this.#foreign = false;
            this.#pkg = application.package;
        }

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

        let resource = split.length ? `${split.join('/')}/${filename}` : filename;
        resource = `${this.#pkg}/${resource}`;

        const {platform} = distribution;
        const key = `${resource}//${platform}`;

        if (!modules.platforms.has(key)) {
            if (modules.resources.has(resource)) {
                this.#error = `Module "${resource}" does not support "${platform}" platform`;
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
                    if (b.iname === name) {
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
        if (!bundle.multilanguage && language) return;
        if (bundle.multilanguage && !language) return;

        this.#found = true;
        this.#is = 'bundle';
        this.#bundle = bundle;
        this.#language = language;
    }
}
