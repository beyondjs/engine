let model;
module.exports = m => (model = m) && Bundle;

class Bundle extends require('./base') {
    #bundle;

    get item() {
        return this.#bundle;
    }

    #name;
    get name() {
        return this.#name;
    }

    get declaration() {
        return this.#bundle.declaration;
    }

    get element() {
        return this.#bundle?.element;
    }

    get packagers() {
        return this.#bundle?.packagers;
    }

    #module;
    get module() {
        return this.#module;
    }

    async _initialise() {
        if (this._id.length < 4) return this._done(`Bundle id "${this.id}" is invalid`);

        const name = this._id[this._id.length - 1];
        await global.bundles.ready;
        if (!global.bundles.has(name)) return this._done(`Bundle "${name}" is not registered ${this.id}`);

        const moduleId = this._id.slice(0, this._id.length - 1);

        const module = new model.ApplicationModule(moduleId);
        await module.ready;
        if (module.error) return this._done(`Bundle ${this.id} not valid, ${module.error}`);

        await module.bundles.ready;
        if (!module.bundles.has(name))
            return this._done(`Module "${module.id}" does not have a bundle "${name}"`);

        const bundle = module.bundles.get(name);
        await bundle.ready;
        this.#bundle = bundle;
        this.#module = module;
        this.#name = name;

        this._done();
    };

    toJSON() {
        const errors = this.formatErrors(this.item.errors, 'bundle');

        return {
            id: this.id,
            name: this.item.name,
            tu: Date.now(),
            updated: this.item.updated,
            destroyed: this.item.destroyed,
            extname: this.item.extname,
            route: this.item.properties?.route,
            layout: this.item.properties?.layout,
            element: this.item.properties?.element,
            errors: errors,
            warnings: this.item.warnings ?? [],
            type: this.item.type,
            subpath: this.item.subpath,
            specifier: this.item.specifier,
            vspecifier: this.item.vspecifier,
            platforms: !this.item?.platforms ? [] : [...this.item.platforms],
            resource: this.item.resource,
            pathname: this.item.pathname
        };
    }
}
