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

    #config;
    get config() {
        return this.#config;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #_static; // Name #static cannot be used as it is reserved by javascript
    get static() {
        return this.#_static;
    }

    constructor(config) {
        super(config);

        this.#config = new (require('./config'))(this);

        // Create the files watcher of the library
        this.#watcher = new BackgroundWatcher({is: 'library', path: config.path});
        this.#watcher.start().catch(exc => console.error(exc.stack));

        this.#modules = new (require('./modules'))(this);
        this.#_static = new (require('./static'))(this, config.properties.get('static'));

        // As the modules are subscribed to the events of the library, then
        // it is required to increase the number of listeners
        this._events.setMaxListeners(500);
    }

    _process() {
        let config = this.children.get('config').child;
        this.#warnings = config.warnings;
        this.#errors = config.errors;
        config = !config.valid || !config.value ? {} : config.value;

        super._process(config);
        this.#modules.configure(config.modules);
    }

    destroy() {
        super.destroy();
        this.#modules.destroy();
        this.#_static.destroy();
        this.#watcher.destroy();
    }

    host(distribution) {
        const {hosts} = this;
        return typeof hosts === 'object' ? hosts[distribution.environment] : hosts;
    }
}
