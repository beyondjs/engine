const {ipc} = global.utils;

module.exports = class {
    #application;
    #initialised;

    constructor(application) {
        this.#application = application;
    }

    #promise;

    async initialise() {
        if (this.#initialised) return;
        if (this.#promise) return await this.#promise.value;
        this.#promise = Promise.pending();

        const id = `application/${this.#application.id}/ssr`;
        const {status} = await ipc.exec('main', 'bees/data', id);
        if (status === 'running') {
            this.#initialised = true;
            return;
        }

        await ipc.exec('main', 'bees/start', id);
        this.#initialised = true;
    }

    async content(pathname, language) {
        if (!this.#initialised) await this.initialise();

        const {dashboard} = global;
        const process = `bee@${this.#application.id}-${dashboard ? 'dashboard' : 'main'}`;
        const rendered = await ipc.exec(process, 'page/get', pathname, language);

        if (rendered.errors?.length) return {errors: rendered.errors};

        // Process the rendered widgets into the script code used to restore the widgets in the client
        const code = `const __beyond_ssr = ${JSON.stringify(rendered)};`;
        return {code};
    }
}
