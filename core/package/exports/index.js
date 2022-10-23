const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.exports';
    }

    #modules;

    constructor(modules) {
        super();
        this.#modules = modules;
        super.setup(new Map([['modules', {child: modules}]]));
    }

    _prepared(require) {
        this.#modules.forEach(module => {
            require(module.bundles) && module.bundles.forEach(bundle => require(bundle));
        });
    }

    _process() {
        this.clear();
        this.#modules.forEach(({bundles}) => {
            bundles.forEach(bundle => this.set(bundle.vspecifier, bundle));
        });
    }
}
