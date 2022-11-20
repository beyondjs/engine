const DynamicProcessor = require('beyond/utils/dynamic-processor');
const PackageExport = require('./package-export');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'plugin.package-exports';
    }

    #plugin;
    #creator;

    #config;

    /**
     * Package export
     *
     * @param plugin {*}
     * @param creator {{defineSubpaths: *, createTargetedExport: *}}
     */
    constructor(plugin, creator) {
        super();
        this.#plugin = plugin;
        this.#creator = creator;

        super.setup(new Map([['plugin.properties', {child: plugin.properties}]]));
    }

    /**
     * Bundles collection is not ready until its configuration is set
     * @return {boolean}
     * @private
     */
    _prepared() {
        return !!this.#config;
    }

    _process() {
        const subpaths = this.#creator.defineSubpaths(this.#config);
        if (!(subpaths instanceof Map)) throw new Error('');

        let changed = false;
        const updated = new Map();
        subpaths.forEach((config, subpath) => {
            subpath = subpath.startsWith('./') ? subpath : `./${subpath}`;

            const packageExport = (() => {
                if (this.has(subpath)) return this.get(subpath);
                changed = true;

                const {createTargetedExport} = this.#creator;
                return new PackageExport(this.#plugin, subpath, {createTargetedExport});
            })();
            packageExport.configure(config);
            updated.set(subpath, packageExport);
        });

        this.forEach((packageExport, subpath) => !updated.has(subpath) && (changed = true) && packageExport.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    destroy() {
        this.forEach(packageExport => packageExport.destroy());
        super.destroy();
    }

    configure(config) {
        this.#config = config;
        this._invalidate();
    }
}
