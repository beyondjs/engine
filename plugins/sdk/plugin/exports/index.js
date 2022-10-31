const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Export = require('./export');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'plugin.exports';
    }

    #plugin;
    #creator;

    #config;

    /**
     * Package export
     *
     * @param plugin {*}
     * @param creator {{subpaths: *, conditional: *}}
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
        const subpaths = this.#creator.subpaths(this.#config);
        if (!(subpaths instanceof Map)) throw new Error('');

        let changed = false;
        const updated = new Map();
        subpaths.forEach((config, subpath) => {
            subpath = subpath.startsWith('./') ? subpath : `./${subpath}`;

            const pexport = (() => {
                if (this.has(subpath)) return this.get(subpath);
                changed = true;

                const {conditional} = this.#creator;
                return new Export(this.#plugin, subpath, {conditional});
            })();
            pexport.configure(config);
            updated.set(subpath, pexport);
        });

        this.forEach((pexport, subpath) => !updated.has(subpath) && (changed = true) && pexport.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    destroy() {
        this.forEach(pexport => pexport.destroy());
        super.destroy();
    }

    configure(config) {
        this.#config = config;
        this._invalidate();
    }
}
