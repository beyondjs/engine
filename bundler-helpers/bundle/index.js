const PSets = require('./psets');
const {bundles: registry} = require('beyond/bundlers-registry');
const equal = require('beyond/utils/equal');
const {join} = require('path');
const Types = require('./types');
const JS = require('./js');
const CSS = require('./css');

module.exports = class extends (require('./attributes')) {
    #module;
    get module() {
        return this.#module;
    }

    get pkg() {
        return this.#module.pkg;
    }

    #path;
    get path() {
        return this.#path;
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

    #psets;
    get psets() {
        return this.#psets;
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
     * The configuration as it is required by the processors sets (psets)
     * @return {*}
     */
    get config() {
        return this.#config?.value;
    }

    #types;
    get types() {
        return this.#types;
    }

    #js;
    get js() {
        return this.#js;
    }

    #css;
    get css() {
        return this.#css;
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
        this.#psets = new PSets(this);
        this.#imports = new (require('./deprecated-imports'))(this);

        const {extname} = this.#meta;
        if (!(extname instanceof Array)) {
            throw new Error(`Property extname in bundle "${type}" specification must be an array`);
        }
        if (!extname.includes('.js') && !extname.includes('.css')) {
            throw new Error(`Property extname in bundle "${type}" ` +
                `specification must include the entries '.js' and/or '.css'`);
        }

        this.#types = this.#meta.types ? new Types(this) : void 0;
        this.#js = extname.includes('.js') ? new JS(this) : void 0;
        this.#css = extname.includes('.css') ? new CSS(this) : void 0;

        this.super.setup(new Map([['bundles-registry', {child: registry}]]));
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

        this.#path = join(this.#module.path, typeof value.path === 'string' ? value.path : '');

        /**
         * Configure the legacy imports
         */
        (() => {
            errors?.length || !value.imports ? this.#imports.configure() :
                this.#imports.configure(this.#path, value.imports);
        })();

        return changed;
    }

    destroy() {
        super.destroy();
        this.#psets.destroy();
    }
}
