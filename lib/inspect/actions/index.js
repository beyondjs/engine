module.exports = class {
    #applications;
    get applications() {
        return this.#applications;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    #templates;
    get templates() {
        return this.#templates;
    }

    #distributions;
    get distributions() {
        return this.#distributions;
    }

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

    #builder;
    get builder() {
        return this.#builder;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    #globalsBundles;
    get globalsBundles() {
        return this.#globalsBundles;
    }

    #dashboard;
    get dashboard() {
        return this.#dashboard;
    }

    #transversal;
    get transversal() {
        return this.#transversal;
    }

    #declarations;
    get declarations() {
        return this.#declarations;
    }

    constructor(service) {
        const plm = new (require('./plm'));

        this.#build = require('./build');
        this.#server = new (require('./server'));

        this.#builder = new (require('./builder'))(service);
        this.#sources = new (require('./sources'))(service);
        this.#dashboard = new (require('./dashboard'))(service);

        this.#bundles = new (require('./bundles'))(plm);
        this.#modules = new (require('./modules'))(plm);
        this.#launchers = new (require('./launchers'))(plm);
        this.#templates = new (require('./templates'))(plm);
        this.#processors = new (require('./processors'))(plm);
        this.#transversal = new (require('./transversal'))(plm);
        this.#declarations = new (require('./declarations'))(plm);
        this.#applications = new (require('./applications'))(plm);
        this.#distributions = new (require('./distributions'))(plm);
        this.#globalsBundles = new (require('./globals-bundles'))(plm);
    }
}
