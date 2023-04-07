module.exports = class {
    #model;
    #distribution = {
        key: 'declaration-tsc',
        name: 'declaration-tsc',
        environment: 'production',
        ts: {compiler: 'tsc'}
    };

    constructor(model) {
        this.#model = model;
    }

    // @deprecated
    async update(params) {

        // console.log(`ipc module dcla`, params)
        const module = new this.#model.Module(params.id);
        await module.ready;
        if (module.error) throw new Error(`Module "${params.id}" not found`);

        // console.log(`ipc module dcla 2`, module.id, module.ready)
        // console.log(`ipc module dcla 2`, module.bundles)
        // module.bundles.forEach(async bundle => {
        //     const packager = await bundle.packagers.get(this.#distribution);
        //     packager.declaration
        // })


        if (!await module.declarations.exists) return;

        module.declarations.update();
    };
}