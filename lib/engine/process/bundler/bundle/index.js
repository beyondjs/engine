const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle';
    }

    #container;
    get container() {
        return this.#container;
    }

    get version() {
        return this.#container.version;
    }

    get application() {
        return this.#container.application;
    }

    get watcher() {
        return this.#container.watcher;
    }

    // The PLM id
    get id() {
        return `${this.#container.id}//${this.#type}`;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    #path;
    get path() {
        return this.#path;
    }

    #packagers;
    get packagers() {
        return this.#packagers;
    }

    /**
     * Stores the processed attributes of the bundle
     */
    #config;
    get config() {
        return this.#config;
    }

    // The name of the bundle type (ex: 'ts', 'sass', etc.)
    #type;
    get type() {
        return this.#type;
    }

    /**
     * The name of the bundle specified in the module.json
     * If the bundle name is not specified, then the bundle type (ex: 'ts', 'sass', etc) is taken by default
     * @return {string}
     */
    get name() {
        return this.#config?.name;
    }

    // The name of the bundle specified in the module.json
    get platforms() {
        return this.#config?.platforms;
    }

    /**
     * The path of the resource relative to the package, used as the exported value in the package.json
     * @return {string}
     */
    get subpath() {
        return this.#config?.subpath;
    }

    get specifier() {
        return this.#config.specifier;
    }

    get vspecifier() {
        return this.#config.vspecifier;
    }

    resource(distribution) {
        const resource = this.container.resource(distribution);
        return resource + (this.container.bundles.size === 1 ? '' : `.${this.name}`);
    }

    pathname(distribution) {
        const pathname = this.container.pathname(distribution);
        return pathname + (this.container.bundles.size === 1 ? '' : `.${this.name}`);
    }

    get multilanguage() {
        return !!this.#config?.multilanguage;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    /**
     * @deprecated: Just for backward compatibility
     */
    #imports;
    /**
     * @deprecated: Just for backward compatibility
     *
     * @return {*}
     */
    get imports() {
        return this.#imports;
    }

    /**
     * This method can be overridden
     * @param config {object} The bundle configuration
     * @return {{value?: object, errors?: string[], warnings?: string[]}}
     */
    processConfig(config) {
        return typeof config !== 'object' ? {errors: ['Invalid configuration']} : {value: config};
    }

    /**
     * Bundler constructor
     *
     * @param container {object} The application module that contains the bundle
     * @param type {string} The bundle's type ('ts', 'sass', etc)
     * @param config {object} The bundle's configuration
     */
    constructor(container, type, config) {
        if (!container || !type) throw new Error('Invalid parameters');
        if (!global.bundles.has(type)) {
            throw new Error(`Bundle "${type}" is not registered`);
        }

        super();
        this.#meta = global.bundles.get(type);
        this.#container = container;
        this.#type = type;
        this.#packagers = new (require('./packagers'))(this);
        this.#imports = new (require('./deprecated-imports'))(this);

        super.setup(new Map([['container', {child: container}], ['config', {child: config}]]));
    }

    _process() {
        const container = this.children.get('container').child;
        const config = this.children.get('config').child;

        const done = ({errors, warnings, value}) => {
            if (equal(this.#errors, errors) && equal(this.#warnings, warnings) && equal(this.#config, config)) {
                return false;
            }

            this.#errors = errors ? errors : [];
            this.#warnings = warnings ? warnings : [];
            this.#config = value;
        }

        this.#path = config.path;
        if (!config.valid || !config.value) {
            const {errors, warnings} = config;
            return done({errors, warnings});
        }

        this.#errors = [];
        const processed = this.processConfig(config.value);
        if (typeof processed !== 'object') throw new Error('Invalid configuration');

        let {errors, warnings, value} = processed;
        if (errors?.length) return done({errors, warnings});

        warnings = warnings ? warnings : [];
        warnings = warnings.concat(config.warnings ? config.warnings : []);
        if (errors?.length) return done({errors, warnings});

        const name = value.name = typeof value.name === 'string' ? value.name : this.#type;
        value.subpath = container.subpath + (container.bundles.size === 1 ? '' : `.${name}`);
        value.specifier = container.specifier + (container.bundles.size === 1 ? '' : `.${name}`);
        value.vspecifier = container.vspecifier + (container.bundles.size === 1 ? '' : `.${name}`);

        value.platforms = (() => {
            let {platforms: {all}} = global;
            let platforms = config.value.platforms ? config.value.platforms : all;
            platforms = typeof platforms === 'string' ? [platforms] : platforms;
            platforms = platforms instanceof Array ? platforms : all;
            platforms = platforms.includes('*') ? all : platforms;

            // Remove the platforms that are not included in the container module
            platforms = platforms.filter(platform => container.platforms.has(platform));

            return new Set(platforms);
        })();

        // Configure the legacy imports
        config.value.imports ? this.#imports.configure(this.path, config.value.imports) : this.#imports.configure();

        return done({warnings, value});
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
