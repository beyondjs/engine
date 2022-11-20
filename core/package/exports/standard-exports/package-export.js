const DynamicProcessor = require('beyond/utils/dynamic-processor');
const TargetedExport = require('./targeted-export');
const WrappedExport = require('./wrapped-export');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export';
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    get is() {
        return 'standard';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    #config;
    #targetedExports = new Map();
    #wrappedExports = new Map();

    constructor(pkg, subpath) {
        super();
        this.#pkg = pkg;
        this.#subpath = subpath;
    }

    getTargetedExport(platform) {
        if (this.#wrappedExports.has(platform)) return this.#wrappedExports.get(platform);

        const targetedExport = this.#targetedExports.get('default');

        const wrappedExport = new WrappedExport(platform);
        this.#wrappedExports.set(platform, wrappedExport);
        wrappedExport.targetedExport = targetedExport;
        return wrappedExport;
    }

    _prepared() {
        return !!this.#config;
    }

    _process() {
        const config = (() => {
            const config = typeof this.#config === 'string' ? {default: this.#config} : this.#config;
            return new Map(Object.entries(config));
        })();

        const updated = new Map();
        let changed = false;

        config.forEach((entry, platform) => {
            const targetedExport = (() => {
                if (this.#targetedExports.has(platform)) return this.#targetedExports.get(platform);
                changed = true;
                return new TargetedExport(this, platform, entry);
            })();
            updated.set(platform, targetedExport);
        });

        // Destroy unused targeted exports
        this.#targetedExports.forEach((targetedExport, key) =>
            !updated.has(key) && (changed = true) && targetedExport.destroy());
        this.#targetedExports.clear();
        updated.forEach((targetedExport, key) => this.#targetedExports.set(key, targetedExport));
    }

    configure(config) {
        this.#config = config ? config : {};
        this._invalidate();
    }

    destroy() {
        super.destroy();
        this.#wrappedExports.forEach(wrappedExport => wrappedExport.destroy());
        this.#targetedExports.forEach(targetedExport => targetedExport.destroy());
    }
}
