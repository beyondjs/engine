module.exports = class {
    #tree;
    get tree() {
        return this.#tree;
    }

    set tree(value) {
        this.#tree = value;
        this.#postprocess(value);
    }

    #errors;
    /**
     * The list of errors generated while processing the dependencies tree
     * @return {Map<string, string>}
     */
    get errors() {
        return this.#errors;
    }

    #list;
    /**
     * The flat list of packages required by the dependency tree
     * @return {Map<string, {version}>}
     */
    get list() {
        return this.#list;
    }

    /**
     * Process the flat list of packages and errors after the dependencies tree was processed
     */
    #postprocess(tree) {
        const list = new Map();
        const errors = new Map();

        const recursive = dependencies => dependencies.forEach(({error, dependencies, version, vpackage}, name) => {
            const vspecifier = `${name}@${version}`;
            if (error) {
                errors.set(vspecifier, {error});
                return;
            }

            list.set(vspecifier, {vpackage, dependencies});
            dependencies && recursive(dependencies);
        });
        recursive(tree);

        this.#list = list;
        this.#errors = errors;
    }

    hydrate(data) {
        const hydrate = branch => {
            const hydrated = new Map(branch);
            hydrated.forEach(({version, dependencies}, name) => {
                const value = {version};
                dependencies && (value.dependencies = hydrate(dependencies));
                return hydrated.set(name, value);
            });

            return hydrated;
        };
        const tree = hydrate(data);

        this.#postprocess(tree);
    }

    toJSON() {
        if (!this.#tree) return;

        const recursive = branch => [...branch].map(([name, {version, dependencies}]) => {
            const value = {version};
            dependencies && (value.dependencies = recursive(dependencies));
            return [name, value];
        });

        return recursive(this.#tree);
    }
}
