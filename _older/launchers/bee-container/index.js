const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal} = global.utils;

/**
 * A container can be an application or a library
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'server.bee.container';
    }

    #is;
    get is() {
        return this.#is;
    }

    #path;
    get path() {
        return this.#path;
    }

    #id;
    get id() {
        return this.#id;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors?.length;
    }

    #values;

    get package() {
        return this.#values?.package;
    }

    #dashboard;
    get dashboard() {
        return this.#dashboard;
    }

    #node;
    get node() {
        return this.#node;
    }

    #backend;
    get backend() {
        return this.#backend;
    }

    // The legacy backend actually required by the dashboard
    #legacy;
    get legacy() {
        return this.#legacy;
    }

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    async _begin() {
        const config = this.children.get('config').child;
        const {path} = config;
        this.#id = await ipc.exec('main', 'ids.path/generate', path);

        const cfg = {};
        cfg.node = config.properties.get('node');
        cfg.ssr = this.is === 'application' ? config.properties.get('ssr') : undefined;
        cfg.backend = config.properties.get('backend');
        cfg.legacy = config.properties.get('legacyBackend');

        this.#node = new (require('./v1'))(this, 'node', cfg.node);
        this.#ssr = cfg.ssr && new (require('./v1'))(this, 'ssr', cfg.ssr);
        this.#backend = new (require('./v1'))(this, 'backend', cfg.backend);
        this.#legacy = new (require('./legacy'))(this, cfg.legacy);
    }

    /**
     * Container constructor
     *
     * @param is {string} Can be 'application', 'library' or 'dashboard' (for the compiled dashboard)
     * @param config {object} The container configuration
     * @param dashboard {boolean} Is it the dashboard instance
     */
    constructor(is, config, dashboard) {
        super();

        if (!config.path) throw new Error(`Property "path" of config parameter was expected`);

        this.#is = is;
        this.#path = config.path;
        this.#dashboard = dashboard;
        super.setup(new Map([['config', {child: config}]]));
    }

    _process() {
        const {valid, value: config, errors, warnings} = this.children.get('config').child;

        const done = ({errors, warnings, values}) => {
            errors = errors ? errors : [];
            warnings = warnings ? warnings : [];
            values = values ? values : {};
            const changed = !equal(this.#errors, errors) ||
                !equal(this.#warnings, warnings) || !equal(this.#values, values);

            this.#errors = errors;
            this.#warnings = warnings;
            this.#values = values;

            return changed;
        }

        if (!valid || !config) return done({errors, warnings});

        const pkg = (({scope, name}) => (scope ? `@${scope}/` : '') + name)(config);
        const values = {package: pkg};
        return done({values, warnings});
    }

    destroy() {
        if (this.destroyed) throw new Error('Container already destroyed');

        this.#node?.destroy();
        this.#ssr?.destroy();
        this.#backend.destroy();
        this.#legacy.destroy();
        super.destroy();
    }
}
