const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.config.application';
    }

    #distribution;
    #ports;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #config;
    get config() {
        return this.#config;
    }

    constructor(application, distribution, ports) {
        super();
        this.#distribution = distribution;
        this.#ports = ports;

        const children = new Map();
        children.set('application', {child: application});
        super.setup(children);
    }

    async _process(request) {
        const application = this.children.get('application').child;
        const distribution = this.#distribution;

        this.#errors = [];
        if (distribution.build && application.connect && !application.host(distribution)) {
            this.#errors.push(`Application must specify its host`);
        }

        const config = {
            name: application.name,
            version: application.version,
            layout: application.layout,
            baseUrl: application.baseUrl ? application.baseUrl : '',
            languages: application.languages,
            defaultLanguage: application.defaultLanguage,
            connect: application.connect
        };
        distribution.local && (config.id = application.id);

        if (distribution.build && application.connect) {
            config.host = application.host(distribution);
            config.host = `${config.host}/applications/${application.name}`;
        }
        else if (application.connect) {
            const port = await this.#ports.get('application', application.id);
            if (this._request !== request) return;

            config.host = `localhost:${port}/applications/${application.name}`;
        }

        const {environment} = distribution;
        const {environments} = global.utils;

        let params = application.params ? application.params.value : {};
        params = Object.assign({}, params, params[environment]);
        environments.forEach(environment => delete params[environment]);
        config.params = params;

        // Only for the dashboard in development mode
        global.dashboard ? params.monitor = distribution.monitor : null;

        const changed = !equal(this.#config, config);
        this.#config = config;

        // Avoid to emit the change event if the information remains the same
        return changed;
    }
}
