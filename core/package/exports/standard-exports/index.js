const DynamicProcessor = require('beyond/utils/dynamic-processor');
const PackageExport = require('./package-export');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.standard-exports';
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

        this.#config.forEach((conditional, subpath) => {
            const packageExport = this.has(subpath) ? this.get(subpath) : new PackageExport(this.#pkg, subpath);
            packageExport.configure(conditional);
            updated.set(subpath, packageExport);
        });

        // Destroy unused exports
        this.forEach((packageExport, subpath) => !updated.has(subpath) && (changed = true) && packageExport.destroy());

        // Set the exports in the collection
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }

    configure(config) {
        const exports = (() => {
            if (typeof config.exports === 'string') return new Map([['.', config.exports]]);
            if (typeof config.exports === 'object') return new Map(Object.entries(config.exports));
            return new Map();
        })();

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
