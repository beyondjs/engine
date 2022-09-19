module.exports = class {
    #launchers;
    get launchers() {
        return this.#launchers;
    }

    #build;
    get build() {
        return this.#build;
    }

    #server;
    get server() {
        return this.#server;
    }

    #bees;
    get bees() {
        return this.#bees;
    }

    #builder;
    get builder() {
        return this.#builder;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #dashboard;
    get dashboard() {
        return this.#dashboard;
    }

    #templates;
    get templates() {
        return this.#templates;
    }

    #libraries;
    get libraries() {
        return this.#libraries;
    }

    #transversal;
    get transversal() {
        return this.#transversal;
    }

    #declarations;
    get declarations() {
        return this.#declarations;
    }

    #applications;
    get applications() {
        return this.#applications;
    }

    constructor(service) {
        this.#launchers = new (require('./launchers'))();

        const actions = new (require('./actions'));

        this.#build = require('./build');
        this.#server = new (require('./server'));
        this.#bees = new (require('./bees'))(actions);
        this.#builder = new (require('./builder'))(service);
        this.#sources = new (require('./sources'))(service);
        this.#bundles = new (require('./bundles'))(actions);
        this.#modules = new (require('./modules'))(actions);
        this.#dashboard = new (require('./dashboard'))(service);
        this.#templates = new (require('./templates'))(actions);
        this.#libraries = new (require('./libraries'))(actions);
        this.#transversal = new (require('./transversal'))(actions);
        this.#declarations = new (require('./declarations'))(actions);
        this.#applications = new (require('./applications'))(actions);
    }
}
