const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * Processes the start code required by the bundles,
 * for example, the bundle "page" which must process all the routes of all modules of an application
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.start.bundles';
    }

    #application;
    #distribution;

    #code;
    get code() {
        if (this.#code !== undefined) return this.#code;

        const application = this.#application;
        const distribution = this.#distribution;
        const {platform} = distribution;
        const {platforms} = global;

        let code = '';
        for (const [name, {child}] of this.children) {
            if (application.engine !== 'legacy' && ['page', 'layout', 'js', 'jsx'].includes(name)) continue;

            // Do not register the widgets in node projects
            if (!platforms.webAndMobileAndSSR.includes(platform) && ['widget'].includes(name)) continue;

            if (!child.code) continue;
            code += global.utils.code.header(`BUNDLE: ${name.toUpperCase()}`);
            code += child.code + '\n';
        }

        return (this.#code = code);
    }

    constructor(application, distribution) {
        super();
        this.#application = application;
        this.#distribution = distribution;

        const children = new Map();
        for (let bundle of global.bundles.values()) {
            if (!bundle.start?.Start) continue;
            const start = new bundle.start.Start(application, distribution);
            children.set(bundle.name, {child: start});
        }
        super.setup(children);
    }

    _process() {
        this.#code = void 0;
    }
}
