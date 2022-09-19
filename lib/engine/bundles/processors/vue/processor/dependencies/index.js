module.exports = class extends global.ProcessorSourcesDependencies {
    get dp() {
        return 'vue.dependencies';
    }

    _update() {
        const errors = [], updated = new Map();

        const add = specifier => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            dependency.is.add('import');
            updated.set(specifier, dependency);
        };
        add('vue');

        return {updated, errors};
    }
}
