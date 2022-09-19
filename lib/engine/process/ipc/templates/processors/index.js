module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * @param ids:[appId//processor]
     */
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const regex = /\/\/[a-zA-z]*/;
        const appIds = ids.map(id => `application//${id.replace(regex, '')}`);
        const templates = new this.#model.Collection(this.#model.Template, appIds);
        await templates.ready;

        const promises = [];
        templates.forEach(template => promises.push(template.processors.ready));
        await Promise.all(promises);

        const output = [];
        for (const id of ids) {
            const [applicationId, processorName] = id.split('//');
            const template = templates.get(`application//${applicationId}`);
            if (template.error) continue;

            const processorWrapper = template.processors.get(processorName);
            const processor = processorWrapper.get(this.#model.webDistribution());
            await processor.ready;

            const data = {};
            data[id] = {
                id: id,
                path: processor?.instance?.path,
                processor: processorName,
                errors: processor?.instance?.errors,
                warnings: processor?.instance?.warnings
            };
            output.push(data);
        }

        return output;
    }
}