const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * Development servers instances manager
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'http.main';
    }

    /**
     * The local specification
     * @type {{inspect: number}} Actually specifying the inspect port of the engine instance
     */
    #local;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    /**
     * Development servers constructor
     *
     * @param core
     * @param local {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(core, local) {
        super();
        this.#local = local;

        super.setup(new Map([['applications', {child: core.applications}]]));
    }

    _prepared(require) {
        const applications = this.children.get('applications').child;
        applications.forEach(application => require(application));
    }

    _process() {
        const applications = this.children.get('applications').child;

        const updated = new Map();
        applications.forEach(application => {
            let as = this.has(application.id) ? this.get(application.id) : undefined;
            as = as ? as : new (require('./application'))(application, this.#local);
            updated.set(application.id, as);
        });

        // Destroy unused applications
        this.forEach((as, key) => !updated.has(key) && as.destroy());

        // Initialise servers
        updated.forEach(as => !as.initialised && !as.initialising &&
            as.initialise().catch(exc => console.log(exc.stack)));

        super.clear(); // Do not use this.clear as it would destroy reused servers
        updated.forEach((value, key) => this.set(key, value));
    }

    clear() {
        this.forEach(as => as.destroy());
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
