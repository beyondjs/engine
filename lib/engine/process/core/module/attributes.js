const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal} = global.utils;
const {platforms} = global;
const {sep} = require('path');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'module';
    }

    /**
     * Stores the processed attributes of the module
     */
    #values = {};

    get name() {
        return this.#values.name;
    }

    /**
     * The path of the resource relative to the package, used as the exported value in the package.json
     * @return {string}
     */
    get subpath() {
        return this.#values.subpath;
    }

    get specifier() {
        return this.#values.specifier;
    }

    get vspecifier() {
        return this.#values.vspecifier;
    }

    resource(distribution) {
        const {platform} = distribution;
        return distribution.npm || platforms.node.includes(platform) ?
               `${this.container.specifier}/${this.subpath}` :
               `${this.container.vspecifier}/${this.subpath}`;
    }

    pathname(distribution) {
        const resource = this.resource(distribution);
        return this.container.is === 'application' ? this.subpath : `packages/${resource}`;
    }

    get title() {
        return this.#values.title;
    }

    get description() {
        return this.#values.description;
    }

    get hmr() {
        return this.#values.hmr;
    }

    get platforms() {
        return new Set(this.#values.platforms);
    }

    get engines() {
        return this.#values.engines;
    }

    /**
     * @deprecated
     * @return {string}
     */
    get layoutId() {
        return this.#values.layoutId;
    }

    /**
     * @deprecated
     * Only required for the 'page' bundle
     * @return {string}
     */
    get route() {
        return this.#values.route;
    }

    /**
     * @deprecated
     * Only required for the 'page' bundle
     * @return {string}
     */
    get vdir() {
        return this.#values.vdir;
    }

    _notify = () => {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'modules',
            id: this.id
        });
    }

    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));
    }

    _process(config) {
        config = config ? config : {};
        const values = {
            name: config.name,
            title: config.title,
            description: config.description,
            hmr: config.hmr,
            engines: config.engines instanceof Array ? config.engines : undefined
        };

        values.platforms = (() => {
            let {platforms: {all}} = global;
            let platforms = config.platforms ? config.platforms : all;
            platforms = typeof platforms === 'string' ? [platforms] : platforms;
            platforms = platforms instanceof Array ? platforms : all;
            platforms = platforms.includes('*') ? all : platforms;
            return platforms;
        })();

        let path = this.file.relative.dirname;
        path = sep === '/' ? path : path.replace(/\\/g, '/');
        path = path.replace(/\/$/, ''); // Remove trailing slash;

        values.subpath = values.name ? values.name : `unnamed/${path}`;
        values.specifier = `${this.container.package}/${values.subpath}`;
        values.vspecifier = `${this.container.package}@${this.container.version}/${values.subpath}`;

        values.layoutId = config.layout; // deprecated
        if (config.bundles?.page) {
            /**
             * Just for the legacy 'page' bundle. It is deprecated, and only used by the dashboard
             * page and route are attributes of the page bundle but are managed as
             * module properties.
             */
            values.route = config.bundles.page.route;
            values.vdir = config.bundles.page.vdir;
        }

        if (equal(values, this.#values)) return false;
        this.#values = values;
    }
}
