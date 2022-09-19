module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        ids = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, ids);
        await applications.ready;

        const promises = [];
        applications.forEach(application => promises.push(application.ready));
        await Promise.all(promises);

        promises.size = 0;
        applications.forEach(application => !application.error && promises.push(application.libraries.ready));
        await Promise.all(promises);

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;
            output[application.item.id] = [];
            for (const appLibrary of application.libraries.values()) {
                output[application.item.id].push({
                    id: appLibrary.id,
                    application: application.item.id,
                    library: appLibrary.library?.id
                });
            }
        }

        return output;
    }

    /**
     * @param ids:[appId//libraryId]
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.ApplicationLibrary, ids);
        await collection.ready;

        const output = {};
        for (const appLibrary of collection.values()) {
            if (appLibrary.error) continue;
            output[appLibrary.id] = {
                id: appLibrary.id,
                application: appLibrary.application.item.id,
                library: appLibrary.library.id
            }
        }

        return output;
    }

    async count(ids) {
        ids = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, ids);
        await applications.ready;

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;
            output[application.id] = [...application.libraries.keys()].length;
        }

        return output;
    }
}
