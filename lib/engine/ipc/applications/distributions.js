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

        const regex = /\/\/.*/;
        const applicationIds = ids.map(id => `application//${id.replace(regex, '')}`);

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
            application.deployment?.distributions.forEach(distribution => {
                output[distribution.id] = {
                    id: distribution.id,
                    name: distribution.name,
                    local: distribution.local,
                    ssr: distribution.ssr,
                    port: distribution.port,
                    ports: distribution.ports,
                    ts: distribution.ts,
                    platform: distribution.platform,
                    compress: distribution.compress,
                    environment: distribution.environment,
                    default: distribution.default,
                    npm: distribution.npm,
                    launcher_id: `${distribution.id.split('//')[0]}/${distribution.name}`
                };
            });
        }

        return output;
    }
}