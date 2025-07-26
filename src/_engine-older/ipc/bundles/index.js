module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const bundles = new this.#model.Collection(this.#model.Bundle, ids);
        await bundles.ready;

        const packagers = new Map();
        for (let bundle of bundles.values()) {
            const {application, platforms} = bundle.item.container;
            const distribution = await this.#model.distribution(application.id, bundle, platforms);
            distribution && !bundle.error && packagers.set(bundle.id, bundle.packagers.get(distribution));
        }

        const promises = [];
        packagers.forEach(packager => promises.push(packager.ready));
        await Promise.all(promises);

        promises.size = 0;
        packagers.forEach(packager => promises.push(packager.processors.ready));
        await Promise.all(promises);

        const output = {};
        for (const bundle of bundles.values()) {
            if (bundle.error) continue;

            const processors = [];
            if (packagers.has(bundle.id)) {
                const packager = packagers.get(bundle.id);
                for (const processor of packager.processors.keys()) {
                    processors.push(`${bundle.id}//${processor}`);
                }
            }

            const data = bundle.toJSON();
            data.processors = processors;
            output[bundle.id] = data;
        }

        return output;
    }
}