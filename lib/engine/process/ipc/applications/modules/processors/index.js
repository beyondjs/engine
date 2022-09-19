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

        const output = {};
        for (const processor of collection.values()) {
            if (processor.error) continue;
            output[processor.id] = processor.toJSON();
        }

        return output;
    }
}
