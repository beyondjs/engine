let model;
module.exports = m => (model = m) && Module;

class Module extends require('./base') {
    #module;

    get item() {
        return this.#module;
    }

    get name() {
        return this.#module?.name;
    }

    get developer() {
        return this.#module?.developer;
    }

    get container() {
        return this.#module?.container;
    }

    get pathname() {
        return this.#module?.pathname;
    }

    get bundles() {
        return this.#module?.bundles;
    }

    get declarations() {
        return this.#module?.declarations;
    }

    get start() {
        return this.#module?.start;
    }

    get static() {
        return this.#module?.static;
    }

    get backend() {
        return this.#module?.backend;
    }

    async _initialise() {
        if (this._id.length < 3) return this._done(`Module id "${this.id}" is invalid`);

        const isLibrary = this.id.includes('library//');
        const Model = isLibrary ? model.Library : model.Application;
        const containerId = this._id.slice(0, 2);
        const container = new Model(containerId);

        await container.ready;
        if (container.error) return this._done(`Module not valid, ${container.error}`);

        const modules = isLibrary ? container.modules : container.modules.self;
        await modules.ready;

        const id = this._id.slice(2).join('/');

        if (!modules.has(id)) return this._done(`Module id "${this.id}" not found`);

        const module = modules.get(id);
        await module.ready;
        await module.bundles.ready;
        this.#module = module;

        this._done();
    };

    toJSON() {
        const module = this.#module;
        const errors = this.formatErrors(module.errors, 'module');

        return {
            id: this.id,
            tu: module.tu,
            name: module.name,
            subpath: module.subpath,
            specifier: module.specifier,
            vspecifier: module.vspecifier,
            path: module.path,
            resource: module.resource,
            pathname: module.pathname,
            title: module.title,
            description: module.description,
            hmr: module.hmr,
            platforms: [...module.platforms],
            container: module.container.id,
            errors: errors,
            warnings: module.warnings ?? []
        };
    }
}
