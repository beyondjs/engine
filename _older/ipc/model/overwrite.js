let model;
module.exports = m => (model = m) && Overwrite;

class Overwrite extends require('./base') {
    #overwrite;

    get item() {
        return this.#overwrite;
    }

    #moduleId;
    get moduleId() {
        return this.#moduleId;
    }

    #template
    get template() {
        return this.#template;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Overwrite id "${this.id}" is invalid`);

        const template = new model.Template(`application//${this._id[0]}`);
        await template.ready;
        if (template.error) return this._done(`Overwrite not valid, ${template.error}`);
        const {overwrites} = template;
        await overwrites.ready;

        const module = this._id.slice(1)[0];
        if (!overwrites.has(module)) return this._done(`Overwrite ${this.id} not valid`);

        const overwrite = overwrites.get(module);
        await overwrite.ready;
        this.#overwrite = overwrite;
        this.#template = template;
        this.#moduleId = module;

        this._done();
    }

    toJSON() {
        return {
            path: this.item.path,
            application: this.#template.application.item.id,
            errors: this.item.errors,
            warnings: this.item.warnings ?? []
        }
    }
}
