let model;
module.exports = m => (model = m) && Compiler;

class Compiler extends require('../base') {
    #source;

    get item() {
        return this.#source;
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
        if (this._id.length !== 6) return this._done(`Compiler id "${this.id}" is invalid`);

        const processorId = this._id.slice(0, this._id.length - 1);
        const processor = new model.Processor(processorId);
        await processor.ready;
        if (processor.error) return this._done(`Compiler not valid, ${processor.error}`);

        const name = this._id[this._id.length - 1];
        const sources = await processor.compilerSources();
        if (!sources) return this._done(`Compiler "${this.id}" not found, compiler not found`);

        const source = [...sources.values()].find(source => source.id === this.id);
        if (!source) return this._done(`Compiler "${this.id}" not found`);

        this.#source = source;
        this.#name = name;
        this.#processor = processor;

        this._done();
    }

    toJSON() {
        const errors = this.formatErrors(this.item.errors, 'diagnostics');

        return {
            id: this.item.id,
            is: this.item.is,
            version: this.item.version,
            errors: errors,
            warnings: this.item.warnings ?? []
        }
    }
}