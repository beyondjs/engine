//TODO @ftovar pendiente migracion ipc-model
module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const libraryIds = ids.map(id => `library//${id}`);
        const collection = new this.#model.Collection(this.#model.Library, libraryIds);
        await collection.ready;

        const promises = [];
        collection.forEach(library => promises.push(library.modules.ready));
        await Promise.all(promises);
        promises.size = 0;
        collection.forEach(library => library.modules.forEach(module => promises.push(module.ready)));

        const output = {};
        for (let library of collection.values()) {
            if (!ids.includes(library.item.id)) continue;

            output[library.item.id] = [];
            for (const module of library.modules.values()) {
                output[library.item.id].push({
                    id: module.id,
                    library: library.item.id
                });
            }
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.LibraryModule, ids);
        await collection.ready;

        const output = {};
        for (const libraryModule of collection.values()) {
            if (libraryModule.error) continue;
            output[libraryModule.id] = {id: libraryModule.id, library: libraryModule.library.item.id};
        }

        return output;
    }

    async count(ids) {
        ids = ids.map(id => `library//${id}`);
        const collection = new this.#model.Collection(this.#model.Library, ids);
        await collection.ready;

        const output = {};
        for (const library of collection.values()) {
            if (library.error) continue;
            output[library.item.id] = [...library.modules.keys()].length;
        }

        return output;
    }
}