const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'layout-bundle.start';
    }

    #cspecs;

    #code;
    get code() {
        return this.#code;
    }

    constructor(application, cspecs) {
        super();
        this.#cspecs = cspecs;

        const children = new Map();
        children.set('modules', {child: application.modules});
        super.setup(children);
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => require(module) && require(module.bundles) &&
            module.bundles.has('layout') && require(module.bundles.get('layout')));
    }

    _process() {
        const modules = this.children.get('modules').child;

        const layouts = [];
        modules.forEach(module => {
            if (!module.bundles.has('layout')) return;

            const bundle = module.bundles.get('layout');
            bundle.layoutId && layouts.push({name: bundle.layoutId, bundle: bundle.specifier});
        });

        this.#code = layouts.length ?
            `routing.config.layouts.register(${JSON.stringify(layouts)});\n` : undefined;
    }
}
