const {ipc} = global.utils;
const {ConfigurableFinder} = global.utils;

module.exports = class extends ConfigurableFinder {
    #application;

    #config;
    get config() {
        return this.#config;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    constructor(application, config) {
        super(application.watcher);
        this.#application = application;
        this.#config = config;
    }

    #initialising = false;
    get initialising() {
        return this.#initialising || super.initialising;
    }

    async initialise() {
        if (this.initialised || this.#initialising) return;
        this.#initialising = true;

        await this.#config.initialise();
        this.#configure();
        this.#config.on('change', this.#configure);

        await super.initialise();
        this.#initialising = false;
    }

    #configure = () => {
        this.#errors = this.#config.errors;
        this.#warnings = this.#config.warnings;

        if (!this.#config.valid || !this.#config.value) {
            super.configure();
            return;
        }

        const config = this.#config.value;
        config.includes = typeof config.includes === 'string' ? [config.includes] : config.includes;

        if (!(config.includes instanceof Array)) {
            this.#errors.push('Invalid includes configuration');
            super.configure();
            return;
        }
        super.configure(this.#config.path, config);
    }

    destroy() {
        super.destroy();
        this.#config.off('change', this.#configure);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications-static',
            filter: {application: this.#application.id}
        });
    }
}