const DynamicProcessor = global.utils.DynamicProcessor(Map);
const External = require('./external');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.externals';
    }

    #application;
    #propagator;

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    /**
     * Externals constructor
     *
     * @param application {object} The application object
     * @param config {object} The externals configuration
     */
    constructor(application, config) {
        super();
        this.setMaxListeners(500); // how many seekers can be active at the same time
        this.#application = application;
        this.#propagator = new (require('./propagator'))(this._events);

        const children = new Map();
        children.set('config', {child: config});
        super.setup(children);
    }

    _process() {
        const config = this.children.get('config').child;
        if (!config.valid || !config.value) {
            super.clear();
            return;
        }

        this.#warnings = [];
        const updated = new Map();

        // Iterate over the registered packages
        let {packages} = config.value;
        if (!(packages instanceof Array)) {
            this.#warnings.push('Entry "packages" is not an array');
            packages = undefined;
        }

        const assign = (name, config) => {
            const external = this.has(name) ? this.get(name) : new External(this.#application, name);

            external.configure(config);
            updated.set(name, external);
            return external;
        }

        packages?.forEach(name => assign(name, {}));

        // Iterate over the registered packages that requires extra configuration than just the package name
        packages = new Map(Object.entries(config.value));
        packages.forEach((config, name) => name !== 'packages' && assign(name, config));

        // Subscribe modules that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(external => !this.has(external.name)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(external => !updated.has(external.name)));

        this.forEach(external => !updated.has(external.package) && external.configure());

        super.clear(); // Do not use this.clear as it would destroy still used externals
        updated.forEach((value, key) => this.set(key, value));
    }
}
