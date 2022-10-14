const PackageBase = require('./base');
const WatchersClient = require('beyond/utils/watchers/client');

module.exports = class extends PackageBase {
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

    #styles;
    get styles() {
        return this.#styles;
    }

    #consumers;
    get consumers() {
        return this.#consumers;
    }

    async _begin() {
        // Create the files watcher for the package
        const config = this.children.get('config').child;
        await config.initialise();

        /**
         * Create the watcher before calling super._begin, as it is required by PackageBase
         */
        this.#watcher = new WatchersClient({is: 'package', path: config.path});
        this.#watcher.start().catch(exc => console.error(exc.stack));

        await super._begin();

        this.#config = new (require('./config'))(this);
        this.#dependencies = new (require('./dependencies'))(this, this.#packages);
        this.#consumers = new (require('./consumers'))(this);
        this.#transversals = new (require('./transversals'))(this);
        this.#template = new (require('./template'))(this, config.properties.get('template'));
        this.#styles = new (require('./styles'))(this);
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
    }

    _process() {
        const {warnings, errors, valid, value} = this.children.get('config').child;
        this.#warnings = warnings;
        this.#errors = errors;

        const config = !valid || !value ? {} : value;
        return super._process(config);
    }

    destroy() {
        super.destroy();
        this.#watcher?.destroy();
        this.#template?.destroy();
        this.#styles?.destroy();
    }
}
