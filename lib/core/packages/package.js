const {BackgroundWatcher} = global.utils.watchers;

module.exports = class extends require('./attributes') {
    #watcher;
    get watcher() {
        return this.#watcher;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    #config;
    get config() {
        return this.#config;
    }

    #excludes;
    get excludes() {
        return this.#excludes;
    }

    #packages;
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #transversals;
    get transversals() {
        return this.#transversals;
    }

    #deployment;
    get deployment() {
        return this.#deployment;
    }

    #template;
    get template() {
        return this.#template;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    #resources = new (require('./resources'))(this);
    get resources() {
        return this.#resources;
    }

    #styles;
    get styles() {
        return this.#styles;
    }

    #builder = new (require('./builder'))(this);
    get builder() {
        return this.#builder;
    }

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    #widgets;
    get widgets() {
        return this.#widgets;
    }

    #consumers;
    get consumers() {
        return this.#consumers;
    }

    async _begin() {
        await super._begin();

        // Create the files watcher for the package
        const config = this.children.get('config').child;
        await config.initialise();

        this.#watcher = new BackgroundWatcher({is: 'package', path: config.path});
        this.#watcher.start().catch(exc => console.error(exc.stack));

        const cfg = {
            libraries: config.properties.get('libraries'),
            template: config.properties.get('template'),
            deployment: config.properties.get('deployment'),
            static: config.properties.get('static'),
            excludes: config.properties.get('excludes'),
            modules: config.properties.get('modules'),
            transversals: config.properties.get('transversals')
        };

        this.#dependencies = new (require('./dependencies'))(this, this.#packages);
        this.#consumers = new (require('./consumers'))(this);
        this.#_static = new (require('./static'))(this, cfg.static);
        this.#modules = new (require('./modules'))(this, cfg.modules, this.#excludes);
        this.#excludes = new (require('./excludes'))(this, cfg.excludes);
        this.#transversals = new (require('./transversals'))(this, cfg.transversals);

        this.#template = new (require('./template'))(this, cfg.template);
        this.#deployment = new (require('./deployment'))(this, cfg.deployment);
        this.#styles = new (require('./styles'))(this);
        this.#ssr = new (require('./ssr'))(this);
        this.#widgets = new (require('./widgets'))(this);

        this.#template.initialise();
    }

    constructor(config, packages) {
        super(config);
        this.#packages = packages;
        this.#config = new (require('./config/'))(this);

        // As the modules are subscribed to the events of the package, then
        // it is required to increase the number of listeners
        this._events.setMaxListeners(500);
    }

    _process() {
        const {warnings, errors, valid, value} = this.children.get('config').child;
        this.#warnings = warnings;
        this.#errors = errors;

        const config = !valid || !value ? {} : value;
        super._process(config);
    }

    host(distribution) {
        const {hosts} = this;
        return typeof hosts === 'object' ? hosts[distribution.environment] : hosts;
    }

    destroy() {
        super.destroy();
        this.#watcher.destroy();
        this.#template.destroy();
        this.#_static.destroy();
        this.#excludes.destroy();
        this.#modules.destroy();
        this.#styles.destroy();
    }
}
