const WatchersClient = require('beyond/utils/watchers/client');

module.exports = class extends require('./attributes') {
    #packages;

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

    #modules;
    get modules() {
        return this.#modules;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #config;
    get config() {
        return this.#config;
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

        this.#config = new (require('./config'))(this);
        this.#dependencies = new (require('./dependencies'))(this, this.#packages);
        this.#consumers = new (require('./consumers'))(this);
        this.#_static = new (require('./static'))(this.#watcher);
        this.#modules = new (require('./modules'))(this);
        this.#transversals = new (require('./transversals'))(this);
        this.#template = new (require('./template'))(this, config.properties.get('template'));
        this.#styles = new (require('./styles'))(this);
        this.#deployment = new (require('./deployment'))(this, config.properties.get('deployment'));
    }

    /**
     * Package constructor
     *
     * @param config {*} The package configuration manager
     * @param packages {*} The packages collection
     */
    constructor(config, packages) {
        super(config.path);
        this.#packages = packages;

        super.setup(new Map([['config', {child: config}]]));

        // As the modules are subscribed to the events of the package
        this._events.setMaxListeners(500);
    }

    _process() {
        const {warnings, errors, valid, value} = this.children.get('config').child;
        this.#warnings = warnings;
        this.#errors = errors;

        const config = !valid || !value ? {} : value;
        super._process(config);

        this.#_static.configure(this.#path, config.static);
        this.#modules.configure(config.modules);
    }

    destroy() {
        super.destroy();
        this.#watcher?.destroy();
        this.#template?.destroy();
        this.#_static?.destroy();
        this.#modules?.destroy();
        this.#styles?.destroy();
    }
}
