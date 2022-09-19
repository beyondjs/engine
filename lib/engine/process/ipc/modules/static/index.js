module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    detail = require('./detail');

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Module, ids);
        await collection.ready;

        const promises = [];
        collection.forEach(module => !module.error && promises.push(module.static.ready));
        await Promise.all(promises);

        const output = {};
        for (const module of collection.values()) {
            if (module.error) continue;

            const items = [];
            module.static.forEach(item => items.push(this.detail(module.id, item, module.pathname)));
            output[module.id] = items;
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const regex = /\/\/[a-zA-z]*\.[a-zA-z]*/;
        const moduleIds = ids.map(id => id.replace(regex, ''));
        const collection = new this.#model.Collection(this.#model.Module, moduleIds);
        await collection.ready;

        const promises = [];
        collection.forEach(module => !module.error && promises.push(module.static.ready));
        await Promise.all(promises);

        const output = {};
        for (const module of collection.values()) {
            if (module.error) continue;

            for (const item of module.static.values()) {
                const file = item.file.toJSON();
                const id = `${module.id}//${file.filename}`;
                if (!ids.includes(id)) continue;
                output[id] = this.detail(module.id, item, module.pathname);
            }
        }

        return output;
    }
}