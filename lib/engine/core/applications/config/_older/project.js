const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'project.start.config.project';
    }

    #distribution;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #config;
    get config() {
        return this.#config;
    }

    constructor(project, distribution) {
        super();
        this.#distribution = distribution;

        const children = new Map();
        children.set('project', {child: project});
        super.setup(children);
    }

    _process() {
        const project = this.children.get('project').child;
        const distribution = this.#distribution;
        const {platform} = distribution;
        const {platforms} = global;

        const config = {
            package: project.package,
            version: project.version,
            languages: project.languages,
            routing: project.routing
        };

        config.routing.mode === 'pathname' && delete config.routing.mode;
        config.routing.ssr === false && delete config.routing.ssr;
        !Object.entries(config.routing).length && delete config.routing;
        platforms.webAndMobileAndSSR.includes(platform) && (config.layout = project.layout);

        const {environment} = distribution;
        const {environments} = global.utils;

        let params = typeof project.params === 'object' ? project.params : {};

        params = Object.assign({}, params, params[environment]);
        environments.forEach(environment => delete params[environment]);

        params = Object.assign(params, params[platform]);
        platforms.all.forEach(platform => delete params[platform]);

        config.params = params;
        global.dashboard && (params.monitor = distribution.monitor);

        const changed = !equal(this.#config, config);
        this.#config = config;

        // Avoid to emit the change event if the information remains the same
        return changed;
    }
}
