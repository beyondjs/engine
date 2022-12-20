module.exports = class extends global.ProcessorSourcesDependencies {
    get dp() {
        return "mdx.dependencies";
    }

    _update() {
        const errors = [],
            updated = new Map();

        const add = (specifier) => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            dependency.is.add("import");
            updated.set(specifier, dependency);
        };
        add("react/jsx-runtime");

        return { updated, errors };
    }
};
