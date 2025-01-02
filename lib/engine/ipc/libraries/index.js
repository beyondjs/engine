module.exports = class {
    #model;
    #libraries;

    constructor(model) {
        this.#model = model;
        this.#libraries = model.core.libraries;
    }

    async list() {
        const output = {};
        await this.#libraries.ready;
        const paths = [...this.#libraries.keys()];

        const promises = [];
        for (const path of paths) {
            if (!this.#libraries.has(path)) continue;
            const library = this.#libraries.get(path);
            promises.push(library.ready);
        }
        await Promise.all(promises);

        const ids = [];
        for (const path of paths) {
            if (!this.#libraries.has(path)) continue;
            const library = this.#libraries.get(path);
            ids.push(`library//${library.id}`);
        }

        const collection = new this.#model.Collection(this.#model.Library, ids);
        await collection.ready;

        for (const library of collection.values()) {
            if (library.error) continue;
            output[library.item.id] = library.toJSON();
        }

        return output;
    }

    /**
     * @param ids:[libraryId]
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        ids = ids.map(id => `library//${id}`);
        const collection = new this.#model.Collection(this.#model.Library, ids);
        await collection.ready;

        const output = {};
        for (const library of collection.values()) {
            if (library.error) continue;
            output[library.item.id] = await library.toJSON();
        }

        return output;
    }
}