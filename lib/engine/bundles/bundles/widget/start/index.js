const DynamicProcessor = global.utils.DynamicProcessor();
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'widget-bundle.start';
    }

    #application;
    #distribution;

    #code;
    get code() {
        return this.#code;
    }

    static dependencies(distribution) {
        if (global.dashboard) return [];

        const {platforms} = global;
        if (!platforms.webAndMobileAndSSR.includes(distribution.platform)) return [];
        return ['@beyond-js/widgets/render'];
    }

    constructor(application, distribution) {
        super();
        this.#application = application;
        this.#distribution = distribution;

        super.setup(new Map([['modules', {child: application.modules}]]));
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return;
            if (!module.bundles.has('widget')) return;
            const bundle = module.bundles.get('widget');
            require(bundle, bundle.id);
        });
    }

    #previous = new Map();

    /**
     * Validate if there are changes, since this method is executed every time the configuration of a bundle changes,
     * whether it is a widget or not.
     * Even in the initialization it can be executed more than once.
     *
     * @return {boolean | undefined} data has changed or not
     * @private
     */
    _process() {
        if (this.#application.engine === 'legacy') {
            this.#code = '';
            return;
        }

        const modules = this.children.get('modules').child;

        const widgets = new Map();
        let changed = false;

        modules.forEach(module => {
            const bundle = module.bundles.has('widget') && module.bundles.get('widget');
            const {properties} = bundle;
            if (!bundle || !bundle.valid || !properties.element.name) {
                changed = changed || this.#previous.has(module.id);
                return;
            }

            const previous = this.#previous.has(module.id) ? this.#previous.get(module.id) : undefined;
            const specs = {
                name: properties.element.name,
                attrs: properties.element.attrs,
                vspecifier: bundle.vspecifier
            };
            properties.is && (specs.is = properties.is);
            properties.render && (specs.render = properties.render);
            properties.route && (specs.route = properties.route);
            properties.layout && (specs.layout = properties.layout);

            changed = changed || !previous || !equal(specs, previous);
            widgets.set(module.id, specs);
        });

        !changed && [...this.#previous.keys()].forEach(moduleId => changed = changed || !widgets.has(moduleId));
        if (!changed) return false;
        this.#previous = widgets;

        let code = '';
        const specs = [];
        widgets.forEach(widget => specs.push(widget));
        code += !widgets.size ? '' :
            `const {widgets} = brequire('@beyond-js/widgets/render');\n` +
            `widgets.register(${JSON.stringify(specs)});\n`;

        this.#code = code;
    }
}
