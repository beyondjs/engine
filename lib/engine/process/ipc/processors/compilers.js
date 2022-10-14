module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Processor, ids);
        await collection.ready;

        const promises = [];
        for (const processor of collection.values()) {
            if (processor.error || !processor.compiler) continue;
            promises.push(processor.compiler.ready);
        }
        await Promise.all(promises);

        const output = {};
        for (const processor of collection.values()) {
            if (processor.error || !processor.compiler) continue;

            const {
                general,
                files,
                dependencies,
                extensions,
                bridges,
                overwrites
            } = processor.compiler.diagnostics.toJSON();
            const diagnostics = {
                general: processor.formatErrors(general, 'diagnostics-general'),
                files: processor.formatErrors(files),
                overwrites: processor.formatErrors(overwrites),
                extensions: processor.formatErrors(extensions),
                bridges: processor.formatErrors(bridges),
                dependencies: processor.formatErrors(dependencies)
            };

            output[processor.id] = {id: processor.id, diagnostics: diagnostics};
        }

        return output;
    }
}