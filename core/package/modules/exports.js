const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Module = require('./exported');

module.exports = class extends DynamicProcessor(Map) {
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

        exports.forEach((conditional, subpath) => {
            const module = this.has(subpath) ? this.get(subpath) : (changed = true) && new Module(this.#pkg, subpath);
            updated.set(subpath, module);

            module.configure(conditional);

            // Move to the bundle
            // conditional = typeof conditional === 'string' ? {default: conditional} : conditional;
            // exports.set(subpath, new Map(Object.entries(conditional)));
        });

        // Destroy unused modules
        this.forEach((module, subpath) => !updated.has(subpath) && (changed = true) && module.destroy());

        // Set the modules in the collection
        this.clear();
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    configure(config) {
        const entries = typeof config.exports === 'object' ? Object.entries(config) : void 0;
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
