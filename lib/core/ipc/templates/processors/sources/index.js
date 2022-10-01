module.exports = class {
    #model;
    #Application;

    constructor(model) {
        this.#model = model;
        this.#Application = model.Application;
    }

    source = require('./source');
    prepare = require('./prepare');

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const regex = /\/\/[a-zA-z]*/;
        const appIds = ids.map(id => `application//${id.replace(regex, '')}`);

        const collection = new this.#model.Collection(this.#model.Template, appIds);
        await this.prepare(collection);

        const output = {};
        for (const id of ids) {
            const [applicationId, processorName] = id.split('//');

            const template = collection.get(`application//${applicationId}`);
            if (template.error || !template.processors.has(processorName)) continue;

            const processor = template.processors[processorName].get(this.#model.webDistribution());
            await processor.ready;
            if (!processor.valid || !processor.instance) continue;

            await processor.instance.files.ready;
            const {files} = processor.instance;

            const promises = [];
            files.forEach(source => promises.push(source.ready));
            await Promise.all(promises);

            output[id] = [...files.values()].map(item => this.source(item, processorName));
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const appIds = ids.map(id => id.split('//').slice(0, 2).join('//'));
        const collection = new this.#model.Collection(this.#model.Template, appIds);
        await this.prepare(collection);

        const output = {};
        for (const id of ids) {
            const [, applicationId, , processorName,] = id.split('//');

            const template = collection.get(`application//${applicationId}`);
            if (template.error || !template.processors.has(processorName)) continue;

            const processor = template.processors[processorName].get(this.#model.webDistribution());
            await processor.ready;
            if (!processor.valid || !processor.instance) continue;

            await processor.instance.files.ready;
            const {files} = processor.instance;

            const promises = [];
            files.forEach(source => promises.push(source.ready));
            await Promise.all(promises);

            [...files.values()].forEach(item => id === item.id && (output[id] = this.source(item, processorName)));
        }

        return output;
    }
}