const PackageBase = require('./base');
const WatchersClient = require('beyond/utils/watchers/client');
const Modules = require('./modules');

module.exports = class extends PackageBase {
    get is() {
        return 'internal';
    }

    #watcher;
    get watcher() {
        return this.#watcher;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    // #config;
    // get config() {
    //     return this.#config;
    // }

    // #transversals;
    // get transversals() {
    //     return this.#transversals;
    // }

    // #template;
    // get template() {
    //     return this.#template;
    // }

    // #styles;
    // get styles() {
    //     return this.#styles;
    // }

    // #consumers;
    // get consumers() {
    //     return this.#consumers;
    // }

    async _begin() {
        // Create the files watcher for the package
        const config = this.children.get('config').child;
        await config.initialise();

        /**
         * Create the watcher before calling super._begin, as it is required by PackageBase
         */
        this.#watcher = new WatchersClient({is: 'package', path: config.path});
        this.#watcher.start().catch(exc => console.error(exc.stack));

        this.#modules = new Modules(this);
        // this.#config = new (require('./config'))(this);
        // this.#consumers = new (require('./consumers'))(this);
        // this.#transversals = new (require('./transversals'))(this);
        // this.#template = new (require('./template'))(this, config.properties.get('template'));
        // this.#styles = new (require('./styles'))(this);

        await super._begin();
    }

    /**
     * Package constructor
     *
     * @param config {*} The package configuration manager
     */
    constructor(config) {
        super(config.path);
        super.setup(new Map([['config', {child: config}]]));
    }

    _process() {
        const {warnings, errors, valid, value} = this.children.get('config').child;
        const config = !valid || !value ? {} : value;
        const changed = super._process(config, errors.slice(), warnings.slice());

        this.#modules.configure(config.modules);

        return changed;
    }

    destroy() {
        super.destroy();
        this.#modules?.destroy();
        this.#watcher?.destroy();
        // this.#template?.destroy();
        // this.#styles?.destroy();
    }
}
