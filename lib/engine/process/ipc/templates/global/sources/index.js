module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    prepare = require('./prepare');
    sources = require('./sources');

    async list(ids) {
        const applicationIds = ids.map(id => `application//${id}`);

        const collection = new this.#model.Collection(this.#model.Template, applicationIds);
        await collection.ready;
        if (collection.error) return;

        await this.prepare(collection, this.#model.webDistribution);

        const output = {};
        collection.forEach(template => {
            const processor = template.global.processors.get(this.#model.webDistribution());
            if (!processor.valid || !processor.instance) return;
            output[template.id] = this.sources(processor.instance.files);
        });

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const appIds = ids.map(id => id.split('//').slice(0, 2).join('//'));

        const collection = new this.#model.Collection(this.#model.Template, appIds);
        await collection.ready;

        await this.prepare(collection, this.#model.webDistribution);

        const output = {};
        collection.forEach(template => {
            const processor = template.global.processors.get(this.#model.webDistribution());
            const sources = this.sources(processor.instance.files);
            const source = sources.find(source => ids.includes(source.id));
            output[source.id] = source;
        });

        return output;
    }
}