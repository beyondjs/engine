module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        ids = ids.map(id => `application//${id}`);
        const collection = new this.#model.Collection(this.#model.Template, ids);
        await collection.ready;

        const promises = [];
        collection.forEach(template => promises.push(template.application.ready));
        await Promise.all(promises);

        promises.size = 0;
        collection.forEach(template => {
            const processor = template.application.processors.get(this.#model.webDistribution());
            promises.push(processor.ready);
        });
        await Promise.all(promises);

        const output = {};
        for (const template of collection.values()) {
            if (template.error) continue;
            const processor = template.application.processors.get(this.#model.webDistribution());

            output[template.id] = {
                id: template.id,
                path: template.application.path,
                processor: processor.instance?.name,
                files: template.application.files,
                errors: template.application.errors,
                warnings: template.application.warnings,
            };
        }

        return output;
    }
}