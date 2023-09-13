module.exports = class {
    #model;
    #distribution = {
        key: 'declaration-tsc',
        name: 'declaration-tsc',
        npm: true,
        environment: 'development',
        ts: {compiler: 'tsc'}
    };

    constructor(model) {
        this.#model = model;
    }

    async update(params) {
        const module = new this.#model.Module(params.id);
        await module.ready;
        if (module.error) throw new Error(`Module "${params.id}" not found`);

        const packagers = [];
        module.bundles.forEach(bundle => packagers.push(bundle.packagers.get(this.#distribution)));
        await Promise.all(packagers);

        let declarations = [];
        packagers.forEach(p => declarations.push(require('./declarations')(p, this.#distribution)));
        declarations = await Promise.all(declarations);

        const response = [];
        declarations.forEach(declaration => !!declaration && response.push(declaration))
        return response;
    }
}