const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.module.sources';
    }

    #bundles;

    constructor(am) {
        super();
        this.#bundles = am.bundles;
        super.setup(new Map([['bundles', {child: am.bundles}]]));
    }

    _prepared(require) {
        const bundles = this.#bundles;
        bundles.forEach(bundle => {
            if (!require(bundle) || !require(bundle.processors)) return;
            bundle.processors.forEach(processor => require(processor) && require(processor.sources.files));
        });
    }

    _process() {
        const bundles = this.#bundles;
        this.clear();
        bundles.forEach(bundle => bundle.processors.forEach(processor => {
            const {files} = processor.sources;
            files.forEach(file => this.set(file.relative.path, {bundle, processor, file}));
        }));
    }
}
