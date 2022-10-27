// Used by the modules without developer name and module name or the libraries without its name
const unnamed = new class {
    #values = new Map();

    get(path) {
        if (this.#values.has(path)) return this.#values.get(path);

        const id = this.#values.size + 1;
        const name = `unnamed:${id}`;
        this.#values.set(path, name);
        return name;
    }
}

/**
 * Returns the id of the bundle
 *
 * @param transversal {object} The transversal
 * @param bundle {object} The bundle of the module or library
 */
exports.get = (transversal, bundle) => {
    const {path} = bundle;

    let library, module;
    bundle.container.is === 'module' ? module = bundle.container : library = bundle.container;

    if (module) {
        const {name, developer, container} = module;
        if (!name || (container.is === 'application' && !developer)) return unnamed.get(path);

        return container.is === 'library' ?
            `beyond_libraries/${container.name}/${name}/${transversal.name}` :
            `beyond_modules/${developer}/${name}/${transversal.name}`;
    }
    else {
        return library.name ? unnamed.get(path) : `beyond_libraries/${library.name}/start`;
    }
}
