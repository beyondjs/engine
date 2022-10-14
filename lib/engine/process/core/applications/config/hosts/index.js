const DynamicProcessor = global.utils.DynamicProcessor();
const ports = (require('./ports'));

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'project.config.ports';
    }

    #project;
    #distribution;
    #local;

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    #backend;
    get backend() {
        return this.#backend;
    }

    constructor(project, distribution, local) {
        super();
        this.#project = project;
        this.#distribution = distribution;
        this.#local = local;
    }

    #find(platform) {
        const {distributions} = this.#project.deployment;
        const distribution = this.#distribution;
        if (!distribution[platform]) return;

        const found = [...distributions.values()].find(({name}) => distribution[platform] === name);
        return !found || found.platform !== platform ? void 0 : found;
    }

    #ports(found) {
        found = found ? found : {
            ssr: this.#find('ssr'),
            backend: this.#find('backend')
        }

        const pkg = this.#project.package;
        return {
            ssr: found.ssr && ports.get(pkg, found.ssr.name),
            backend: found.backend && ports.get(pkg, found.backend.name)
        };
    }

    _prepared(require) {
        // Check distributions are prepared
        const project = this.#project;
        const {distributions} = project.deployment;
        if (!require(project) || !require(distributions)) return false;
        if (![...distributions.values()].reduce((prev, distribution) => require(distribution) && prev, true)) return false;
        if (!this.#local) return;

        const ports = this.#ports();
        ports.ssr && require(ports.ssr);
        ports.backend && require(ports.backend);
    }

    _process() {
        if (this.#local) {
            const found = {
                ssr: this.#find('ssr'),
                backend: this.#find('backend')
            };

            const ports = this.#ports(found);
            ports.ssr && (this.#ssr = {
                host: `http://localhost:${ports.ssr.value}`,
                local: found.ssr.name
            });
            ports.backend && (this.#backend = {
                host: `http://localhost:${ports.backend.value}`,
                local: found.backend.name
            });
        }
        else {
            this.#ssr = {host: this.#find('ssr')?.host};
            this.#backend = {host: this.#find('backend')?.host};
        }
    }
}
