module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Processor, ids);
        await collection.ready;

        const output = {};
        for (const processor of collection.values()) {
            if (processor.error) continue;

            const sources = await processor.files();
            if (!sources) continue;

            output[processor.id] = [...sources.values()].map(source =>
                ({
                    id: source.id,
                    version: source.version,
                    code: source.content,
                    hash: source.hash,
                    file: source.file,
                    filename: source.filename,
                    dirname: source.dirname,
                    basename: source.basename,
                    extname: source.extname,
                    relative: {file: source.relative?.file, dirname: source.relative?.dirname}
                })
            );
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Source, ids);
        await collection.ready;

        const output = {};
        for (const source of collection.values()) {
            if (source.error) continue;
            output[source.id] = source.toJSON();
        }

        return output;
    }
}
