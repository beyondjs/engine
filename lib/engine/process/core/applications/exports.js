const DynamicProcessor = global.utils.DynamicProcessor(Map);

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

    prepared(require) {
        if (!require(this.#pkg)) return;

        const {modules} = this.#pkg;
        if (!require(modules)) return;

        modules.forEach(module => require(module) && require(module.bundles));
    }

    process() {
        this.clear();
        const {modules} = this.#pkg;
        modules.forEach(({bundles}) => bundles.forEach(bundle => {
            console.log('the bundle:', bundle);
        }));
    }
}
