const {ipc} = global.utils;

module.exports = class {
    #bee;

    constructor(bee) {
        this.#bee = bee;
        ipc.handle('page/get', this.#render);
    }

    #render = async (uri, language) => {
        await this.#bee.started;

        const {bundles} = this.#bee;
        const {errors, bundle} = await bundles.import('@beyond-js/ssr/renderer/ts');
        if (errors) {
            console.log('SSR renderer bundle errors', errors);
            throw new Error(`Errors found on SSR renderer bundle`);
        }

        try {
            const {renderer} = bundle.exports;
            return await renderer.render(uri, language);
        }
        catch (exc) {
            console.error(exc.stack);
            return {exception: exc.stack};
        }
    }
}
