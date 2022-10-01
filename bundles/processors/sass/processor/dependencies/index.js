module.exports = class extends global.ProcessorAnalyzerDependencies {
    get dp() {
        return 'sass.dependencies';
    }

    #files;
    get files() {
        return this.#files;
    }

    constructor(processor) {
        super(processor, require('./dependency'));
        this.#files = new (require('./files'))(this);
    }

    _update() {
        const {errors, updated} = super._update();
        if (errors?.length) return {errors};

        // Processor 'sass' requires '@beyond-js/kernel/styles' as a dependency
        (() => {
            const styles = '@beyond-js/kernel/styles';
            if (this.has(styles)) return;

            const dependency = this._create(styles);
            dependency.is.add('import');
            updated.set(styles, dependency);
        })();

        return {updated};
    }
}
