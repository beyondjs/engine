/**
 * Resources manager of the template of the application
 */
module.exports = class {
    #config;

    get path() {
        return this.#config.path;
    }

    #application;
    get application() {
        return this.#application;
    }

    #global;
    get global() {
        return this.#global;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    #overwrites;
    get overwrites() {
        return this.#overwrites;
    }

    constructor(application, config) {
        this.#config = config;

        const props = {
            application: config.properties.get('application'),
            global: config.properties.get('global'),
            processors: config.properties.get('processors'),
            overwrites: config.properties.get('overwrites')
        };

        this.#application = new (require('./application'))(application, props.application);
        this.#global = new (require('./global'))(application, props.global);
        this.#processors = new (require('./processors'))(application, props.processors);
        this.#overwrites = new (require('./overwrites'))(props.overwrites);
    }

    initialise() {
        this.#overwrites.initialise().catch(exc => console.log(exc.stack));
    }

    destroy() {
        this.#application.destroy();
        this.#global.destroy();
        this.#processors.destroy();
        this.#overwrites.destroy();
    }
}