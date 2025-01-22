module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * @param ids:[appId//libraryId]
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const applicationIds = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, applicationIds);
        await applications.ready;

        const promises = [];
        applications.forEach(app => !app.error && promises.push(app.deployment.ready));
        await Promise.all(promises);

        promises.size = 0;
        applications.forEach(app => !app.error && promises.push(app.deployment.distributions.ready));
        await Promise.all(promises);

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;

            const distributions = [];
            application.deployment?.distributions.forEach(d => distributions.push(d.id));
            output[application.item.id] = {
                id: application.item.id,
                distributions: distributions,
                valid: application.deployment.valid,
                errors: application.deployment.errors
            };
        }

        return output;
    }
}