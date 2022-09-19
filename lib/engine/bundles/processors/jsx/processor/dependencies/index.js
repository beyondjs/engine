module.exports = class extends global.ProcessorSourcesDependencies {
    get dp() {
        return 'jsx.dependencies';
    }

    _update() {
        const errors = [], updated = new Map();

        const add = resource => {
            const dependency = this.has(resource) ? this.get(resource) : this._create(resource);
            dependency.is.add('import');
            updated.set(resource, dependency);
        };
        add('react');
        add('react-dom');

        return {updated, errors};
    }
}
