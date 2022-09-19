/**
 * The application library
 */
module.exports = class extends require('./attributes') {
    get is() {
        return 'library';
    }

    #applications;
    #pkg;

    get package() {
        return this.#pkg;
    }

    #application;
    get application() {
        return this.#application;
    }

    #library;
    get library() {
        return this.#library;
    }

    get watcher() {
        return this.#application.watcher;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    host = distribution => this.#library.host(distribution);

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    /**
     * Application library constructor
     *
     * @param application {object} The application object
     * @param pkg {string} The package name of the project/library being imported
     * @param applications {object} The registered applications collection
     */
    constructor(application, pkg, applications) {
        super(application, pkg);
        this.#application = application;
        this.#pkg = pkg;
        this.#applications = applications;

        this.#modules = new (require('../modules'))(this);
        this.#modules.on('change', () => this._events.emit('modules.change'));

        this.#_static = new (require('../static'))(this);
        this.#bundles = new global.Bundles(this);

        super.setup(new Map([['applications', {child: applications}]]));
    }

    _prepared(require) {
        let prepared = true;
        this.#applications.forEach(application => prepared = require(application) && prepared);
        if (!prepared) return;

        this.#library = [...this.#applications.values()].find(application => application.package === this.#pkg);
        this.#library && require(this.#library);
    }

    _process() {
        this.#errors = [];
        !this.#library && this.#errors.push([`Project package "${this.#pkg}" not found`]);

        this.#modules.library = this.#library;
        this.#_static.library = this.#library;
    }

    destroy() {
        super.destroy();
        this.#modules.destroy();
        this.#bundles.destroy();
        this.#_static.destroy();
    }
}
