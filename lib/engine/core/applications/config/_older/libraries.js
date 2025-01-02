const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.config.libraries';
    }

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

    constructor(libraries, distribution, ports) {
        super();
        this.#distribution = distribution;
        this.#ports = ports;

        super.setup(new Map([['libraries', {child: libraries}]]));
    }

    _prepared(require) {
        const libraries = this.children.get('libraries').child;
        libraries.forEach(library => require(library));
    }

    async _process(request) {
        const libraries = this.children.get('libraries').child;
        const distribution = this.#distribution;

        const config = [], errors = [];

        /**
         * Check if
         */
        libraries.forEach(library => {
            if (!distribution.build) return;
            if (['@beyond-js/local', '@beyond-js/dashboard-lib'].includes(library.package)) return;
            if (library.legacy && !library.connect) return;
            if (distribution.host) return;

            errors.push(`Library "${library.name}" must specify its host`);
        });
        if (errors.length) {
            this.#errors = errors;
            this.#config = undefined;
            return !equal(this.#errors, errors) || !equal(this.#config, config);
        }

        for (const al of libraries.values()) {
            if (!al.library) continue;
            if (distribution.build && al.package === '@beyond-js/local') continue;

            const value = {
                package: al.package,
                version: al.version,
                connect: al.connect
            };
            distribution.local && (value.local = {id: al.library.id});

            const pkg = al.package;
            const namespace = pkg.startsWith('@') ? pkg.substr(1) : pkg;

            if (distribution.build && al.connect) {
                if (al.package === '@beyond-js/dashboard-lib') {
                    value.host = `##beyond-host-namespace-[${namespace}]##`;
                }
                else {
                    value.host = al.host(distribution);
                    value.host = `${value.host}/${namespace}`;
                }
            }
            else if (false && al.connect) {
                const {id, package: pkg} = al.library;
                const type = ['@beyond-js/dashboard-lib', '@beyond-js/local'].includes(pkg) ? 'legacy' : 'backend';

                const port = await this.#ports.get('library', id, type);
                if (this._request !== request) return;
                value.host = `http://localhost:${port}/${namespace}`;
            }

            config.push(value);
        }

        if (equal(this.#config, config)) return false;
        this.#config = config;
    }
}
