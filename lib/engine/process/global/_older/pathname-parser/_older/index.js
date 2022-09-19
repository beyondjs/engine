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

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    // Can be 'processor' (for sources), 'bundle', or 'transversal'
    #is;
    get is() {
        return this.#is;
    }

    #hmr;
    get hmr() {
        return this.#hmr;
    }

    #extname;
    get extname() {
        return this.#extname;
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #language;
    get language() {
        return this.#language;
    }

    #id;
    get id() {
        return this.#id;
    }

    #name;
    get name() {
        return this.#name;
    }

    #pkg;

    get package() {
        return this.#pkg;
    }

    checkLanguage(multilanguage) {
        return require('./language').check(this.bundle, multilanguage, this.#language);
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

    // Search and return the bundle or transversal bundle
    async find(distribution) {
        return await require('./find')(this, distribution);
    }

    async process() {
        const application = this.#application;
        const pathname = this.#pathname;
        let extname = pathname.endsWith('.d.ts') ? '.d.ts' : void 0;
        this.#extname = extname = extname ? extname : require('path').extname(pathname);

        const split = pathname.substr(1, pathname.length - 1 - extname.length).split('/');
        const filename = split.pop().split('.');

        // Parse the language
        const {error, bundle, language} = require('./language').parse(application, filename, extname);
        if (error) {
            this.#error = error;
            return;
        }

        this.#bundle = bundle;
        this.#processor = processor;
        this.#hmr = qs.parse(this.#query).hmr !== void 0;
        this.#language = language;

        const {bundles} = global;
        await bundles.ready;

        // If the resource is not a bundle, just go away
        if (!bundles.has(bundle)) return;

        // Check if resource is a transversal bundle
        if (!split.length) {
            // At this point the resource can only be a transversal bundle
            const specs = bundles.get(bundle);
            this.#is = specs.transversal ? 'transversal' : void 0;
            return;
        }

        this.#is = processor ? 'processor' : 'bundle';

        // If the resource do not starts with '/packages', then it is a bundle contained in the application package
        if (split[0] !== 'packages') {
            this.#name = split.join('/');
            this.#id = `${application.package}/${this.#name}`;
            this.#pkg = application.package;
            return;
        }

        split.shift(); // // Remove the 'packages' entry
        this.#id = split.join('/');

        if (!split.length) {
            this.#error = 'Invalid url';
            return;
        }

        const pkg = this.#pkg = {};
        if (split[0].startsWith('@')) {
            if (split.length < 2) {
                this.#error = 'Invalid url';
                return;
            }

            pkg.scope = split.shift();
            pkg.name = split.shift();
        }
        else {
            pkg.name = split.shift();
        }

        pkg.id = (pkg.scope ? `${pkg.scope}/` : '') + pkg.name;
        this.#name = this.#id.substr(pkg.id.length + 1);
    }
}
