module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const bundles = new this.#model.Collection(this.#model.Bundle, ids);
        await bundles.ready;

        const packagers = new Map();
        for (const bundle of bundles.values()) {
            if (bundle.error) continue;
            const {application, platforms} = bundle.item.container;
            const distribution = await this.#model.distribution(application.id, bundle, platforms);
            distribution && packagers.set(bundle.id, bundle.packagers.get(distribution));
        }

        const promises = [];
        packagers.forEach(packager => promises.push(packager.ready));
        await Promise.all(promises);

        promises.size = 0;
        packagers.forEach(packager => promises.push(packager.consumers.ready));
        await Promise.all(promises);

        const output = {};
        bundles.forEach(bundle => {
            if (bundle.error) return;

            const packager = packagers.get(bundle.id);
            if (!packager) {
                console.error(`Bundle "${bundle.id}" packager is undefined`);
                return;
            }

            const items = [];
            packager.consumers.forEach(consumer =>
                items.push({
                    id: `${bundle.id}///${consumer.id}`,
                    tu: Date.now(),
                    module_id: consumer.container?.id,
                    bundle: consumer.id
                })
            );
            output[bundle.id] = items;
        });

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const output = {};
        ids.forEach(id => {
            const consumerId = id.split('///');
            output[id] = {id: id, tu: Date.now(), bundle: consumerId[1]}
        });

        return output;
    }
}
