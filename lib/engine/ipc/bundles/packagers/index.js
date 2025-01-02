module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const packagers = new this.#model.Collection(this.#model.Packager, ids);
        await packagers.ready;

        const output = {};
        packagers.forEach(pkg => {
            if (pkg.error) return;
            output[pkg.id] = pkg.toJSON()
        });

        return output;
    }
}