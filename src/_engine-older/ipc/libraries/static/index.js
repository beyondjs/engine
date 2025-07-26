//TODO @ftovar pendiente migracion ipc-model
module.exports = class {
    #model;
    #libraries;

    constructor(model) {
        this.#model = model.Library;
        this.#libraries = model.core.libraries;
    }

    detail = require('./detail');

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const libraryIds = ids.map(id => `library//${id}`);
        const collection = new this.#model.Collection(this.#model.Library, libraryIds);
        await collection.ready;

        const promises = [];
        collection.forEach(library => promises.push(library.static.ready));
        await Promise.all(promises);

        const output = {};
        for (const library of collection.values()) {
            if (library.error) continue;

            const items = [];
            library.static.forEach(item => items.push(this.detail(id, item)));
            output[id] = items;
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const output = {};
        for (const id of ids) {
            const library = new this.#model(id);
            await library.ready;
            if (library.error) continue;

            // await library.static.ready;
            [...library.static.values()].map(item => {
                if (!id.endsWith(item.filename)) return;
                output[id] = this.detail(id.replace(`//${item.filename}`, ''), item);
            });
        }

        return output;
    }
}