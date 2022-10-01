const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'project.start.config.backends';
    }

    #project;
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

    constructor(project, distribution) {
        super();
        this.#project = project;
        this.#distribution = distribution;
        this.#ports = new (require('./ports'))();
    }

    _prepared(require) {
        const project = this.#project;
        const {libraries, deployment} = project;
        const {distributions} = deployment;
        if (!require(project) || !require(libraries) || !require(distributions)) return;

        libraries.forEach(library => require(library));
        distributions.forEach(distribution => require(distribution));
    }

    async _process(request) {
        const project = this.#project;
        const distribution = this.#distribution;

        const hosts = new Map(), errors = [];

        for (const al of project.libraries.values()) {
            const {library, legacy, connect} = al;
            if (!library || (legacy && !connect)) continue;

            // If it is a legacy backend, it will only run in local environment or it is a build distribution
            if (legacy) {
                if (!distribution.local && library.package === '@beyond-js/local') continue;
                if (!distribution.local && library.package === '@beyond-js/dashboard-lib') {
                    hosts.set(`${al.package}/legacy`, '##dashboard-lib-host##');
                    continue;
                }

                const name = `${library.package}/legacy`;
                const port = await this.#ports.get(name);
                if (this._request !== request) return;
                hosts.set(name, `http://localhost:${port}`);
                continue;
            }

            // If it is a v1 backend
            const imported = distribution.imports?.get(library.package);
            if (!imported) continue;

            const {distributions} = project.deployment;
            const found = [...distributions.values()].find(({name}) => imported === name);
            if (!found || found.platform !== 'backend') continue;

            const name = `${library.package}/${imported}`;
            const port = distribution.local ? await this.#ports.get(name) : void 0;
            if (this._request !== request) return;

            const host = distribution.local ? `http://localhost:${port}` : found.host;
            hosts.set(name, host);
        }

        // Set the backend of the current project (if it is configured)
        await (async () => {
            if (!distribution.backend) return;

            const {distributions} = project.deployment;
            const found = [...distributions.values()].find(({name}) => distribution.backend === name);
            if (!found || found.platform !== 'backend') return;

            const name = `${project.package}/${found.name}`;
            const port = distribution.local ? await this.#ports.get(name) : void 0;
            const host = distribution.local ? `http://localhost:${port}` : found.host;
            hosts.set(name, host);
        })();
        if (this._request !== request) return;

        const config = [...hosts];
        if (equal(this.#config, config) && equal(this.#errors, errors)) return false;
        this.#config = config;
    }
}
