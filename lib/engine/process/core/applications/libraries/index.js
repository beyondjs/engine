const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The collection of libraries imported by the application
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.libraries';
    }

    #applications;
    #libraries;
    #application;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #propagator;

    /**
     * Application libraries constructor
     *
     * @param application {object} The application
     * @param applications {object} The registered applications collection
     * @param libraries {object} The registered libraries collection
     * @param config {object} The application libraries configuration
     */
    constructor(application, applications, libraries, config) {
        super();
        this.#application = application;
        this.#applications = applications;
        this.#libraries = libraries;

        const children = new Map();
        children.set('libraries', {child: libraries});
        children.set('config', {child: new (require('./config'))(application, config)});
        super.setup(children);

        this.#modules = new (require('./modules'))(this);
        this.#propagator = new (require('./propagator'))(this._events);
    }

    _process() {
        const libraries = this.children.get('libraries').child;
        const config = this.children.get('config').child;

        this.#warnings = libraries.warnings.concat(config.warnings);
        if (!libraries.valid || !config.valid) {
            this.#errors = libraries.errors.concat(config.errors);
            return;
        }

        this.#errors = [];
        const updated = new Map();
        for (const imported of config.imports) {
            let library;
            if (this.has(imported)) {
                library = this.get(imported);
            }
            else {
                const legacy = ['@beyond-js/local', '@beyond-js/ui', '@beyond-js/plm', '@beyond-js/dashboard-lib'];
                const version = legacy.includes(imported) ? 'legacy' : 'v1';
                const libraries = version === 'legacy' ? this.#libraries : this.#applications;
                library = new (require(`./library/${version}`))(this.#application, imported, libraries);
            }
            updated.set(imported, library);
        }

        // Subscribe libraries that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(library => !this.has(library.package)));

        // Unsubscribe unused libraries
        this.#propagator.unsubscribe([...this.values()].filter(library => !updated.has(library.package)));

        // Destroy unused application libraries
        this.forEach((library, pkg) => !updated.has(pkg) && library.destroy());

        // Set the updated data into the collection
        super.clear(); // Do not use this.clear(), as it would destroy libraries still being used
        updated.forEach((value, key) => this.set(key, value));
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications-libraries',
            filter: {application: this.#application.id}
        });
    }

    clear() {
        this.#propagator.unsubscribe([...this.values()]);
        this.forEach(library => library.destroy());
        super.clear();
    }
}
