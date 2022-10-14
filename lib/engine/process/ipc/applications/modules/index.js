module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    prepare = require('./prepare');

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const appsIds = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, appsIds);
        await applications.ready;
        await this.prepare(applications);

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;
            output[application.item.id] = [];
            for (const am of application.modules.values()) {

                //filter only application modules
                if (application.item.id !== am.module.container.id) continue;

                const bundles = [];
                for (const bundle of am.bundles.keys()) {
                    bundles.push(`${am.id}//${bundle}`);
                }

                output[application.item.id].push({
                    id: am.id,
                    module: am.module.id,
                    bundles: bundles,
                    application: application.item.id
                });
            }
        }

        return output;
    }

    /**
     * @param ids:[ApplicationLibraryModule | ApplicationModule]
     * ApplicationLibraryModule: application//appId//library//libraryId//moduleName
     * ApplicationModule: application//appId//moduleName
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const applications = new this.#model.Collection(this.#model.ApplicationModule, ids);
        await applications.ready;

        const promises = [];
        applications.forEach(am => !am.error && am.bundles && promises.push(am.bundles.ready));
        await Promise.all(promises);

        const output = {};
        for (const am of applications.values()) {
            if (am.error) continue;

            const bundles = [];
            for (const bundle of am.bundles.keys()) {
                bundles.push(`${am.id}//${bundle}`);
            }

            output[am.id] = {
                id: am.id,
                module: am.module.id,
                bundles: bundles,
                application: am.application.item.id
            };
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
            output[application.item.id] = [...application.modules.keys()].length;
        }

        return output;
    }
}