const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.config.ssr';
    }

    #application;
    #distribution;
    #ports;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #config;
    get config() {
        return this.#config;
    }

    constructor(application, distribution, ports) {
        super();
        this.#application = application;
        this.#distribution = distribution;
        this.#ports = ports;
    }

    _prepared(require) {
        const application = this.#application;
        const {libraries, deployment} = application;
        const {distributions} = deployment;
        if (!require(application) || !require(libraries) || !require(distributions)) return;

        libraries.forEach(library => require(library));
        distributions.forEach(distribution => require(distribution));
    }

    async _process(request) {
        const application = this.#application;
        const distribution = this.#distribution;

        const errors = [];
        for (const al of application.libraries.values()) {
            const {library} = al;
            if (!library) return;

            const imported = distribution.imports?.get(library.package);
            if (!imported) continue;

            const {distributions} = application.deployment;
            const found = [...distributions.values()].find(({name}) => imported === name);
            if (!found || found.platform !== 'ssr') continue;

            const pkg = library.package;
            const name = `${pkg}/${imported}`;
            const port = distribution.local ? await this.#ports.get(name) : void 0;
            if (this._request !== request) return;

            const host = distribution.local ? `http://localhost:${port}` : found.host;
            hosts.set(pkg, host);
        }

        // Set the ssr host of the current project (if it is configured)
        const hosts = await (async () => {
            if (!distribution.ssr) return;

            const hosts = new Map();
            const {distributions} = application.deployment;
            const found = [...distributions.values()].find(({name}) => distribution.ssr === name);
            if (!found || found.platform !== 'ssr') return;

            const pkg = application.package;
            const name = `${pkg}/${found.name}`;
            const port = distribution.local ? await this.#ports.get(name) : void 0;
            const host = distribution.local ? `http://localhost:${port}` : found.host;
            hosts.set(pkg, host);
            return hosts;
        })();
        if (this._request !== request) return;

        const config = hosts && [...hosts];
        if (equal(this.#config, config) && equal(this.#errors, errors)) return false;
        this.#config = config;
    }
}
