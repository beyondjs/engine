module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    // @deprecated
    async update(params) {
        const module = new this.#model.Module(params.id);
        if (module.error) throw new Error(`Module "${params.id}" not found`);

        if (!await module.declarations.exists) return;

        module.declarations.update();
    };
}