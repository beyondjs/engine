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

    #config;
    #code;
    get code() {
        return this.#code;
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
        const config = {}, errors = [];

        libraries.forEach(library => {
            if (['@beyond-js/local', '@beyond-js/dashboard'].includes(library.package)) return;
            if (!distribution.build || !library.connect || library.host(distribution)) return;
            errors.push(`Library "${library.name}" must specify its hosts`);
        });

        if (errors.length) {
            this.#errors = errors;
            this.#config = undefined;
            return !equal(this.#errors, errors) || !equal(this.#config, config);
        }

        for (const applicationLibrary of libraries.values()) {
            if (distribution.build && applicationLibrary.name === 'beyond-local') continue;

            const value = {
                version: applicationLibrary.version,
                connect: applicationLibrary.connect
            };
            distribution.local && (value.id = applicationLibrary.library.id);

            if (distribution.build && applicationLibrary.connect) {
                if (distribution.dashboard) {
                    value.host = `##beyond-library[${applicationLibrary.name}]-host##`;
                }
                else {
                    value.host = applicationLibrary.host(distribution);
                    value.host = `${config.host}/libraries/${applicationLibrary.name}`;
                }
            }
            else if (applicationLibrary.connect) {
                const port = await this.#ports.get('library', applicationLibrary.library.id);
                if (this._request !== request) return;
                value.host = `localhost:${port}/libraries/${applicationLibrary.name}`;
            }

            config[applicationLibrary.name] = value;
        }

        if (equal(this.#config, config)) return false;
        this.#config = config;

        let code = '';
        for (const entry of Object.entries(config)) {
            const [name, config] = entry;
            code += `beyond.libraries.set('${name}', ${JSON.stringify(config)});\n`;
        }

        this.#code = code;
    }
}
