module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.ProcessorCompiler, ids);
        await collection.ready;

        const output = {};
        for (const compiler of collection.values()) {
            if (compiler.error) continue;

            console.log(21, compiler.id, compiler.diagnostics)
            output[compiler.id] = {id: compiler.id, diagnostics: compiler.diagnostics};
        }

        return output;
    }
}