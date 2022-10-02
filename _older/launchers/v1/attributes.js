const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bee.v1';
    }

    #is;
    get is() {
        return this.#is;
    }

    get container() {
        return this.children.get('container').child;
    }

    #configured = false;
    get configured() {
        return this.#configured;
    }

    #port;
    get port() {
        return this.#port;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    // Actually there is no configuration available, here for when needed
    #values = {};

    async _begin() {
        const container = this.children.get('container').child;
        const is = this.#is;
        const {id, dashboard} = container;
        this.#port = is === 'backend' ? await ipc.exec('main', 'ports.reserve', `${is}@${id}`, dashboard) : void 0;
    }

    /**
     * Legacy BeyondJS execution environment constructor
     *
     * @param container {object} The bee container can be a library or an application
     * @param is {string} The BEE can be 'node', 'ssr', 'backend'
     * @param config {object} The service configuration
     */
    constructor(container, is, config) {
        super();
        this.#is = is;

        super.setup(new Map([
            ['container', {child: container}],
            ['config', {child: config}]
        ]));
    }

    _process() {
        const {valid, value: config, errors, warnings} = this.children.get('config').child;

        const done = ({errors, warnings, values}) => {
            errors = errors ? errors : [];
            warnings = warnings ? warnings : [];

            this.#configured = !!values;
            values = values ? values : {};

            const changed = !equal(this.#errors, errors) ||
                !equal(this.#warnings, warnings) || !equal(this.#values, values);

            this.#errors = errors;
            this.#warnings = warnings;
            this.#values = values;

            return changed;
        }

        if (!valid || !config) return done({errors, warnings});

        const values = {};
        return done({values, warnings});
    }
}
