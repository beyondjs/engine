const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    #is;
    #config;

    #errors = [];
    get errors() {
        return this.#errors.concat(this.#config.errors);
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(is, config) {
        super();
        this.setMaxListeners(1000);
        if (!['bundles', 'processors'].includes(is)) throw new Error('Invalid parameters');

        this.#is = is;
        super.setup(new Map([['config', {child: config}]]));
    }

    _process() {
        let {valid, value, errors, warnings} = this.children.get('config').child;

        const done = ({errors, warnings, items}) => {
            this.#errors = errors ? errors : [];
            this.#warnings = warnings ? warnings : [];

            this.clear();
            items && items.forEach((value, key) => this.set(key, value));
        }

        if (!valid) return done({errors, warnings});

        value = value ? value : {};
        let {register} = value;
        register = typeof register === 'string' ? [register] : register;
        register && !(register instanceof Array) && warnings.push(`Property "register" should be an array`);
        register = register instanceof Array ? register : [];
        register = register.filter(item => typeof item === 'string');

        const items = new Map();
        for (const specifier of register) {
            try {
                const items = require(specifier);
                if (!(items instanceof Array)) continue;
                if (!Item.name) continue;
                items.forEach(Item => items.set(Item.name, Item));
            }
            catch (exc) {
                warnings.push(`Error registering "${specifier}": ${exc.message}`);
            }
        }

        return done({items});
    }
}
