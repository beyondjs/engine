const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'page-bundle.start';
    }

    #distribution;

    #code;
    get code() {
        return this.#code;
    }

    constructor(application, distribution) {
        super();
        this.#distribution = distribution;

        const children = new Map();
        children.set('modules', {child: application.modules});
        super.setup(children);
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => require(module) && require(module.bundles) &&
            module.bundles.has('page') && require(module.bundles.get('page')));
    }

    _process() {
        const modules = this.children.get('modules').child;

        const routes = [], is = {};
        modules.forEach(module => {
            if (!module.bundles.has('page')) return;

            const bundle = module.bundles.get('page');
            if (bundle.route) {
                const vdir = !!bundle.vdir;
                routes.push({
                    route: bundle.route,
                    bundle: bundle.resource(this.#distribution),
                    vdir: vdir,
                    layout: bundle.layout
                });
            }
            else if (bundle.pageIs) {
                is[bundle.pageIs] = `${bundle.pageIs}.js`;
            }
        });

        let code = '';
        code += routes.length ? `routing.config.pages.register(${JSON.stringify(routes)});\n` : '';
        code += is.error ? `routing.error = '${is.error}';\n` : '';
        code += is.loading ? `routing.loading = '${is.loading}';` : '';

        this.#code = code;
    }
}
