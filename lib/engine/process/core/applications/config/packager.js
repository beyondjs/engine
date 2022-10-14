const DynamicProcessor = global.utils.DynamicProcessor();
const mformat = require('beyond/mformat');
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'project.config';
    }

    #distribution;
    #local;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #code;
    get code() {
        return this.#code;
    }

    constructor(project, distribution, local) {
        super();
        this.#distribution = distribution;
        this.#local = local;

        super.setup(new Map([
            ['project', {child: project}],
            ['hosts', {child: new (require('./hosts'))(project, distribution, local)}]
        ]));
    }

    #previous;

    _process() {
        const project = this.children.get('project').child;
        const hosts = this.children.get('hosts').child;
        if (!project.processed || !hosts.processed) {
            throw new Error('Project is not ready. Wait for the .ready property before calling this property.');
        }

        this.#errors = [];
        this.#code = undefined;

        if (!project.valid) {
            this.#errors = project.errors.slice();
            return;
        }

        const config = {
            package: project.package,
            version: project.version,
            languages: project.languages,
            routing: project.routing
        };

        this.#local && (config.local = this.#distribution.name);

        // Routing configuration
        (() => {
            config.routing.mode === 'pathname' && delete config.routing.mode;
            config.routing.ssr === false && delete config.routing.ssr;
            !Object.entries(config.routing).length && delete config.routing;
        })();

        // Layout configuration
        (() => {
            const distribution = this.#distribution;
            const {platform} = distribution;
            platforms.webAndMobileAndSSR.includes(platform) && (config.layout = project.layout);
        })();

        config.params = (() => {
            const distribution = this.#distribution;
            const {environment} = distribution;
            const {environments} = global.utils;
            const {platform} = distribution;

            let params = typeof project.params === 'object' ? project.params : {};

            params = Object.assign({}, params, params[environment]);
            environments.forEach(environment => delete params[environment]);

            params = Object.assign(params, params[platform]);
            platforms.all.forEach(platform => delete params[platform]);
            return params;
        })();

        hosts.ssr && (config.ssr = hosts.ssr);
        hosts.backend && (config.backend = hosts.backend);

        // Check if project configuration has changed
        if (equal(this.#previous = config)) return false;
        this.#previous = config;

        let code = `export default ${JSON.stringify(config)};\n`;
        const {mode} = this.#distribution.bundles;
        ({code} = mformat({code, mode}));
        this.#code = code;
    }
}
