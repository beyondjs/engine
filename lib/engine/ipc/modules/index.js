module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     *
     * @param ids:[appId//libraryId]
     * library: application//appId//library//libraryId//moduleName
     * module: application//appId//moduleName
     *
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Module, ids);
        await collection.ready;

        const output = {};
        for (const module of collection.values()) {
            if (module.error) continue;
            output[module.id] = module.toJSON();
        }

        return output;
    }
}