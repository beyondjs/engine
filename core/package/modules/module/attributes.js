const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const equal = require('beyond/utils/equal');
const cspecs = require('beyond/cspecs');
const {sep} = require('path');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'module';
    }

    /**
     * Stores the processed attributes of the module
     */
    #values = {};

    get subpath() {
        return this.#values.subpath;
    }

    get specifier() {
        return this.#values.specifier;
    }

    get vspecifier() {
        return this.#values.vspecifier;
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

    _process(config, errors) {
        const values = {
            subpath: config.subpath ? config.subpath : config.name,
            title: config.title,
            description: config.description,
            hmr: config.hmr,
            engines: config.engines instanceof Array ? config.engines : void 0
        };

        values.platforms = (() => {
            if (errors?.length) return [];

            const all = cspecs.platforms.slice();
            let platforms = config.platforms ? config.platforms : all;
            platforms = typeof platforms === 'string' ? [platforms] : platforms;
            platforms = platforms instanceof Array ? platforms : all;
            platforms = platforms.includes('*') ? all : platforms;
            return platforms;
        })();

        values.subpath = (() => {
            if (values.subpath) return values.subpath;

            let subpath = this.file.relative.dirname;
            subpath = sep === '/' ? subpath : subpath.replace(/\\/g, '/');
            return subpath.replace(/\/$/, ''); // Remove trailing slash;
        })();

        values.specifier = `${this.pkg.name}/${values.subpath}`;
        values.vspecifier = `${this.pkg.name}@${this.pkg.version}/${values.subpath}`;

        /**
         * Just for the legacies 'page' and 'layout' bundles.
         * It is deprecated, and only used by the dashboard. Attributes page and route are required
         * by the page bundle but are managed as module properties.
         */
        (() => {
            values.layoutId = config.layout;
            if (config.bundles?.page) {
                values.route = config.bundles.page.route;
                values.vdir = config.bundles.page.vdir;
            }
        })();

        if (equal(values, this.#values)) return false;
        this.#values = values;
    }
}
