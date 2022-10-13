module.exports = class {
    #model;
    #applications;

    constructor(model) {
        this.#model = model;
        this.#applications = model.core.applications;
    }

    async ready() {
        await this.#applications.ready;
        const promises = [];
        this.#applications.forEach(application => promises.push(application.ready));
        await Promise.all(promises);
    }

    async build({application, distribution}) {
        await require('./build')(this.#applications, application, distribution);
    }

    async list() {
        await this.ready();
        const paths = [...this.#applications.keys()];

        const ids = [];
        for (const path of paths) {
            if (!this.#applications.has(path)) continue;
            const application = this.#applications.get(path);
            ids.push(`application//${application.id}`);
        }

        const applications = new this.#model.Collection(this.#model.Application, ids);
        await applications.ready;

        const promises = [];
        applications.forEach(application => promises.push(application.modules.ready));
        await Promise.all(promises);

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;
            output[application.item.id] = application.toJSON();
        }

        return output;
    }

    /**
     * @param ids:[appId]
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        ids = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, ids);
        await applications.ready;

        const promises = [];
        applications.forEach(application => !application.error && promises.push(application.modules.ready));
        await Promise.all(promises);

        const output = {};
        for (const application of applications.values()) {
            if (application.error) continue;
            output[application.item.id] = application.toJSON();
        }

        return output;
    }
}
