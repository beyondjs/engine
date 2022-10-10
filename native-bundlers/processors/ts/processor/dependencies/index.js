const {ProcessorAnalyzerDependencies} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorAnalyzerDependencies {
    get dp() {
        return 'ts.dependencies';
    }

    #declarations;
    get declarations() {
        return this.#declarations;
    }

    constructor(processor) {
        super(processor, require('./dependency'));
        this.#declarations = new (require('./declarations'))(this);
    }

    _update() {
        const {errors, updated} = super._update();
        if (errors?.length) return {errors};

        // Processor 'ts' requires '@beyond-js/kernel/bundle' as a dependency, except itself
        const bkb = '@beyond-js/kernel/bundle';

        const {bundle} = this.processor.specs;
        if (bkb === bundle.specifier || updated.has(bkb)) return {updated};

        if (this.has(bkb)) {
            const bundle = this.get(bkb);
            bundle.is.add('import');
            updated.set(bkb, bundle);
        }
        else {
            const dependency = this._create(bkb);
            dependency.is.add('import');
            updated.set(bkb, dependency);
        }

        return {updated};
    }

    destroy() {
        super.destroy();
        this.#declarations.destroy();
    }
}
