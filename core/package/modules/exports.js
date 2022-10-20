const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Module = require('./exported');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.modules.exports';
    }

    #pkg;
    #config;

    constructor(pkg) {
        super();
        this.#pkg = pkg;
    }

    _prepared() {
        return !!this.#config;
    }

    _process() {
        const updated = new Map();
        let changed = false;

        const modules = new Map();
        this.#config.forEach((conditional, subpath) => {
            const bundles = new Map();
            bundles.set('default', conditional);
            modules.set(subpath, bundles);
        });

        modules.forEach((bundles, subpath) => {
            const module = this.has(subpath) ? this.get(subpath) : (changed = true) && new Module(this.#pkg, subpath);
            updated.set(subpath, module);
            module.bundles.configure(bundles);
        });

        // Destroy unused modules
        this.forEach((module, subpath) => !updated.has(subpath) && (changed = true) && module.destroy());

        // Set the modules in the collection
        this.clear();
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    configure(config) {
        const entries = typeof config.exports === 'object' ? Object.entries(config.exports) : void 0;
        const exports = new Map(entries);

        /**
         * Normalise the export of the main bundle
         */
        if (!exports.has('.')) {
            const conditional = {};
            const sanitize = path => !path.startsWith('./') ? `./${path}` : path;
            config.module && (conditional.module = conditional.browser = sanitize(config.module));
            config.main && (conditional.default = sanitize(config.main));

            exports.set('.', conditional);
        }

        this.#config = exports;
    }
}
