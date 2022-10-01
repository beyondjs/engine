const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.deployment.distributions';
    }

    #application;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(application) {
        super();
        this.#application = application;
    }

    async _begin() {
        await this.#application.deployment.ready;
    }

    _prepared() {
        return this.#configured;
    }

    #configured = false;

    configure(config) {
        this.#configured = true;

        if (!(config instanceof Array)) {
            config && (this.#errors = ['Invalid configuration']);
            this.clear();
            this._invalidate();
            return;
        }

        const updated = new Map();
        for (const item of config) {
            if (typeof item !== 'object') continue;

            const key = require('./key')(item);
            let distribution = this.has(key) && this.get(key);
            if (!distribution) {
                distribution = new (require('./distribution'))(this.#application, item, true, key);
                distribution.initialise().catch(exc => console.log(exc.stack));
            }

            updated.set(key, distribution);
            distribution.configure(item.ports, item.port);
        }

        // Destroy unused distributions
        this.forEach(distribution => !updated.has(distribution.key) && distribution.destroy());

        super.clear(); // Do not use this.clear as it would destroy reused distributions
        updated.forEach((value, key) => this.set(key, value));
        this._invalidate();
    }

    clear = () => {
        this.forEach(distribution => distribution.destroy());
        super.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications-distributions',
            filter: {application: this.#application.id}
        });
    }
}