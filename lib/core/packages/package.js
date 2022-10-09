const WatchersClient = require('beyond/utils/watchers/client');

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

    #packages;

    #modules;
    get modules() {
        return this.#modules;
    }

    #excludes;
    get excludes() {
        return this.#excludes;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #transversals;
    get transversals() {
        return this.#transversals;
    }

    #template;
    get template() {
        return this.#template;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    #deployment;
    get deployment() {
        return this.#deployment;
    }

    #styles;
    get styles() {
        return this.#styles;
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

        this.#watcher = new WatchersClient({is: 'package', path: config.path});
        this.#watcher.start().catch(exc => console.error(exc.stack));

        const cfg = {
            modules: config.properties.get('modules'),
            excludes: config.properties.get('excludes'),
            template: config.properties.get('template'),
            static: config.properties.get('static'),
            transversals: config.properties.get('transversals'),
            deployment: config.properties.get('deployment')
        };

        this.#dependencies = new (require('./dependencies'))(this, this.#packages);
        this.#consumers = new (require('./consumers'))(this);
        this.#_static = new (require('./static'))(this, cfg.static);
        this.#modules = new (require('./modules'))(this, cfg.modules, this.#excludes);
        this.#excludes = new (require('./excludes'))(this, cfg.excludes);
        this.#transversals = new (require('./transversals'))(this, cfg.transversals);

        this.#template = new (require('./template'))(this, cfg.template);
        this.#styles = new (require('./styles'))(this);
        this.#template.initialise();

        this.#deployment = new (require('./deployment'))(this, cfg.deployment);
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
