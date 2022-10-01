const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The collection of internal dependencies of the application
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.dependencies.internals';
    }

    #applications;
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
     * Application internal dependencies constructor
     *
     * @param application {object} The application
     * @param applications {object} The registered applications collection
     * @param config {object} The application libraries configuration
     */
    constructor(application, applications, config) {
        super();
        this.#application = application;
        this.#applications = applications;

        const children = new Map();
        children.set('config', {child: new (require('./config'))(application, config)});
        super.setup(children);

        this.#modules = new (require('./modules'))(this);
        this.#propagator = new (require('./propagator'))(this._events);
    }

    _process() {
        const config = this.children.get('config').child;

        this.#errors = [];
        this.#warnings = [];
        const updated = new Map();
        for (const imported of config.imports) {
            const library = this.has(imported) ? this.get(imported) :
                new (require(`./library`))(this.#application, imported, this.#applications);
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
