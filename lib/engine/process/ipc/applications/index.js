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

    async process({application, distribution, build, declarations}) {
        if (!application || !distribution) throw new Error('Invalid parameters - Application process.');
        if (!build && !declarations) throw new Error('No actions to process');

        const appModel = new this.#model.Application(`application//${application}`);
        await appModel.ready;
        if (appModel.error) {
            console.error(`Application "${application}" not found`);
            return;
        }
        await require('./process')(appModel, distribution, {build, declarations});
    }
}
