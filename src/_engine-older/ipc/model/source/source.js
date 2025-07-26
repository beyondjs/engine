let model;
module.exports = m => (model = m) && Source;

class Source extends require('../base') {
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
        if (this._id.length !== 6) return this._done(`Source id "${this.id}" is invalid`);

        const processorId = this._id.slice(0, this._id.length - 1);
        const processor = new model.Processor(processorId);
        await processor.ready;
        if (processor.error) return this._done(`Source not valid, ${processor.error}`);

        const name = this._id[this._id.length - 1];
        const files = await processor.files();
        if (!files) return this._done(`Processor "${processor.id}" has no files`);

        const source = [...files.values()].find(source => source.id === this.id);
        if (!source) return this._done(`Source "${this.id}" not found`);

        this.#source = source;
        this.#name = name;
        this.#processor = processor;

        this._done();
    }

    toJSON() {
        return {
            id: this.item.id,
            version: this.item.version,
            code: this.item.content,
            hash: this.item.hash,
            file: this.item.file,
            filename: this.item.filename,
            dirname: this.item.dirname,
            basename: this.item.basename,
            extname: this.item.extname,
            relative: {file: this.item.relative?.file, dirname: this.item.relative?.dirname}
        }
    }
}
