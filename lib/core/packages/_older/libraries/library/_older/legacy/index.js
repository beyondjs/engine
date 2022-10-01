/**
 * The application library
 */
module.exports = class extends require('./attributes') {
    get is() {
        return 'library';
    }

    get legacy() {
        return true;
    }

    #libraries;
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
        return this.#library.watcher;
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
     * @param libraries {object} The registered libraries collection
     */
    constructor(application, pkg, libraries) {
        super(application, pkg);
        this.#application = application;
        this.#pkg = pkg;
        this.#libraries = libraries;

        this.#modules = new (require('../modules'))(this);
        this.#modules.on('change', () => this._events.emit('modules.change'));

        this.#_static = new (require('../static'))(this);
        this.#bundles = new global.Bundles(this);

        const events = ['item.change'];
        super.setup(new Map([['libraries', {child: libraries, events}]]));
    }

    _prepared(check) {
        let prepared = true;
        this.#libraries.forEach(library => prepared = check(library) && prepared);
        if (!prepared) return false;

        this.#library = [...this.#libraries.values()].find(library => library.package === this.#pkg);
        this.#library && check(this.#library);
    }

    _process() {
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
