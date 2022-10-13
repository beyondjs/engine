let model;
module.exports = m => (model = m) && Dependency;

class Dependency extends require('../base') {
    #dependency;

    get item() {
        return this.#dependency;
    }

    #name;
    get name() {
        return this.#name;
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    async _initialise() {
        if (this._id.length !== 2) return this._done(`Dependency id "${this.id}" is invalid`);

        const processor = new model.Processor(this._id[0]);
        await processor.ready;
        if (processor.error) return this._done(`Dependency not valid, ${processor.error}`);

        const bundleId = this._id[1].replace('dependency//', '');

        await processor.dependencies.ready;
        const dependency = processor.dependencies.get(bundleId);
        if (!dependency) return this._done(`Source "${this.id}" not found`);

        this.#dependency = dependency;
        this.#processor = processor;
        this.#name = this._id.length[1];

        this._done();
    }

    toJSON() {
        const sources = [];
        this.item.sources.forEach(source => sources.push(source.id));

        return {
            id: this.item.id,
            is: sources,
            version: this.item.version,
            resource: this.item.resource,
            errors: this.item.errors,
            warnings: this.item.warnings
        }
    }
}
