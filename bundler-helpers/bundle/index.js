const {bundles: registry} = require('beyond/bundlers-registry');
const equal = require('beyond/utils/equal');

module.exports = class extends (require('./attributes')) {
    #module;
    get module() {
        return this.#module;
    }

    get pkg() {
        return this.#module.pkg;
    }

    // The PLM id
    get id() {
        return `${this.#module.id}//${this.#type}`;
    }

    // The name of the bundle type (ex: 'ts', 'sass', etc.)
    #type;
    get type() {
        return this.#type;
    }

    /**
     * The meta object returned by the bundles registry
     */
    #meta;
    get meta() {
        return this.#meta;
    }

    #packagers;
    get packagers() {
        return this.#packagers;
    }

    /**
     * @deprecated: Just for backward compatibility to support the imports property in the module.json
     */
    #imports;
    /**
     * @deprecated: Just for backward compatibility
     *
     * @return {*}
     */
    get imports() {
        return this.#imports;
    }

    #config;
    /**
     * The configuration as it is required by the packagers of the bundle
     * @return {*}
     */
    get config() {
        return this.#config?.value;
    }

    /**
     * This method can be overridden
     *
     * @param config {*} The configuration of the bundle as it is set in the module.json
     * @param errors string[]
     * @param warnings string[]
     */
    configure(config, errors, warnings) {
        if ((warnings && !(warnings instanceof Array)) || (errors && !(errors instanceof Array))) {
            throw new Error('Invalid parameters');
        }

        const done = ({config, errors, warnings}) => {
            errors = errors ? errors : [];
            warnings = warnings ? warnings : [];
            const value = {value: config, errors, warnings};

            if (equal(this.#config, value)) return;
            this.#config = value;
            this._invalidate();
        }

        if (errors?.length) {
            return done({errors, warnings});
        }
        if (typeof config !== 'object') {
            return done({errors: [`Bundle's configuration must be an object`]});
        }
        else {
            return done({config, warnings});
        }
    }

    /**
     * Bundler constructor
     *
     * @param module {object} The bundle's module container
     * @param type {string} The bundle's type ('ts', 'sass', etc)
     */
    constructor(module, type) {
        if (!module || !type) throw new Error('Invalid parameters');
        if (!registry.has(type)) throw new Error(`Bundle "${type}" is not registered`);

        super();
        this.#meta = registry.get(type);
        this.#module = module;
        this.#type = type;
        this.#packagers = new (require('./packagers'))(this);
        this.#imports = new (require('./deprecated-imports'))(this);

        super.setup(new Map([
            ['bundles-registry', {child: registry}],
            ['module', {child: module}]
        ]));
    }

    /**
     * Bundle is not ready until its configuration is set
     * @return {boolean}
     * @private
     */
    _prepared() {
        return !!this.#config;
    }

    _process() {
        const {value, errors, warnings} = this.#config;
        const changed = super._process({config: value, errors, warnings});

        /**
         * Configure the legacy imports
         */
        (() => {
            const {path, config} = errors?.length || !value.imports ? {} : {path: this.path, config: value.imports};
            this.#imports.configure(path, config);
        })();

        return changed;
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
