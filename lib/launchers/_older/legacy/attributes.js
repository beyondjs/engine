const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bee.legacy';
    }

    get container() {
        return this.children.get('container').child;
    }

    #configured = false;
    get configured() {
        return this.#configured;
    }

    #id;
    get id() {
        return this.#id;
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

    #values = {};

    get core() {
        return this.#values.core;
    }

    get sessions() {
        return this.#values.sessions;
    }

    get modules() {
        return this.#values.modules;
    }

    async _begin() {
        const container = this.children.get('container').child;
        const id = this.#id = `bee@${container.id}`;
        this.#port = await ipc.exec('main', 'ports.reserve', id, container.dashboard);
    }

    /**
     * Legacy BeyondJS execution environment constructor
     *
     * @param container {object} The service container
     * @param config {object} The service configuration
     */
    constructor(container, config) {
        super();

        super.setup(new Map([
            ['container', {child: container}],
            ['config', {child: config}]
        ]));
    }

    _process() {
        const {path, package: pkg} = this.children.get('container').child;
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
        if (!pkg) return done({errors: ['Container must have a package name']});

        const values = {
            core: config.core,
            sessions: config.sessions,
            modules: config.modules ? config.modules : './modules'
        };

        // Adjust "core" and "sessions" and "modules" properties.
        // If those have been configured as strings,
        // they must be transformed to objects whose path property is the specified string.
        // Also check if the path property is specified, and set the absolute path
        // from the relative configured path.
        const adjust = (property) => {
            let value = values[property];
            if (!value) {
                delete values[property];
                return;
            }

            value = typeof value === 'string' ? {path: value} : value;
            if (!value.path) {
                delete values[property];
                return;
            }

            value.path = require('path').join(path, value.path);

            values[property] = value;
        };

        adjust('core');
        adjust('sessions');
        adjust('modules');

        return done({values, warnings});
    }
}
