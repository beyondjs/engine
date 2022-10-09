const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {header} = require('beyond/utils/code');
const {platforms} = require('beyond/cspecs');
const {bundles} = require('beyond/bundlers-registry');

/**
 * Processes the start code required by the bundles,
 * for example, the bundle "page" which must process all the routes of all modules of an application
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'application.start.bundles';
    }

    #application;
    #cspecs;

    #code;
    get code() {
        if (this.#code !== undefined) return this.#code;

        const application = this.#application;
        const cspecs = this.#cspecs;
        const {platform} = cspecs;

        let code = '';
        for (const [name, {child}] of this.children) {
            if (application.engine !== 'legacy' && ['page', 'layout', 'js', 'jsx'].includes(name)) continue;

            // Do not register the widgets in node projects
            if (!platforms.webAndMobileAndSSR.includes(platform) && ['widget'].includes(name)) continue;

            if (!child.code) continue;
            code += header(`BUNDLE: ${name.toUpperCase()}`);
            code += child.code + '\n';
        }

        return (this.#code = code);
    }

    constructor(application, cspecs) {
        super();
        this.#application = application;
        this.#cspecs = cspecs;

        const children = new Map();
        for (let bundle of bundles.values()) {
            if (!bundle.start?.Start) continue;
            const start = new bundle.start.Start(application, cspecs);
            children.set(bundle.name, {child: start});
        }
        super.setup(children);
    }

    _process() {
        this.#code = void 0;
    }
}
