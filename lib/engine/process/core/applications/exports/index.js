const DynamicProcessor = global.utils.DynamicProcessor(Map);
const TargetedExport = require('./targeted-export');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'package.exports';
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;
    }

    _prepared(require) {
        if (!require(this.#pkg)) return;

        const {modules} = this.#pkg;
        if (!require(modules)) return;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return;
            module.bundles.forEach(bundle => require(bundle));
        });
    }

    _process() {
        this.clear();
        const {modules} = this.#pkg;
        modules.forEach(module => {
            if (module.pkg.specifier !== this.#pkg.specifier) return;

            module.bundles.forEach(bundle => {
                const subpath = `./${bundle.subpath}`;
                const platforms = this.has(subpath) ? this.get(subpath) : new Map();
                bundle.platforms.forEach(platform => {
                    platforms.set(platform, new TargetedExport(bundle, platform));
                });

                this.set(subpath, platforms);
            });
        });
    }

    destroy() {
        super.destroy();
        this.forEach(platforms => platforms.forEeach(te => te.destroy()));
    }
}
