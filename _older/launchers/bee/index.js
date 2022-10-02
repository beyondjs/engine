require('./global');
const {ipc} = global.utils;

new class {
    #specs;
    get specs() {
        return this.#specs;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    constructor() {
        let __bee = {specs: void 0, bridges: void 0};
        try {
            this.#specs = __bee.specs = JSON.parse(process.argv[2]);
            Object.defineProperty(global, '__bee', {get: () => __bee});
        }
        catch (exc) {
            console.error('Error parsing BEE specification', exc.stack);
            process.exit();
            return;
        }

        const {specs} = __bee;
        const dashboard = specs.dashboard ? ':dashboard' : '';
        process.title = `"${specs.project.pkg}${dashboard}" project`;

        // Make bridges available to the backend server
        __bee.bridges = new (require('./bridges'))(this);

        // The bundles collection & importer
        this.#bundles = new (require('./bundles'))(this);

        // Start the BEE engine and execute the start bundle
        this.#start().catch(exc => console.error(exc.stack));
    }

    async #start() {
        await ipc.exec('main', 'beyond-local/start', this.#specs.dashboard ? 'dashboard' : 'main');

        // Retrieves, compiles / executes the project configuration code (config.js)
        await require('./config')(this);

        // Load @beyond-js/local
        await this.#bundles.import('@beyond-js/local/main');

        const bundle = await this.#bundles.import('start');
        bundle.errors && require('./log')(this.#specs.project, {
            type: 'start.error',
            errors: bundle.errors
        });

        // In ssr and backend platforms, the 'initialised' event is emitted
        // by @beyond-js/ssr and @beyond-js/backend packages after their servers are initialised.
        // It is required by @beyond-js/local to know where the server is ready to accept requests
        !['ssr', 'backend'].includes(this.#specs.distribution.platform) && process.send({type: 'ready'});
    }
}
