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

        const done = ({errors, warnings, values}) => {
            this.#errors = errors ? errors : [];
            this.#warnings = warnings ? warnings : [];

            this.clear();
            values && values.forEach((value, key) => this.set(key, value));
        }

        if (!valid) return done({errors, warnings});

        value = value ? value : {};
        let {register} = value;
        register = typeof register === 'string' ? [register] : register;
        register && !(register instanceof Array) && warnings.push(`Property "register" should be an array`);
        register = register instanceof Array ? register : [];

        register = register.filter(item => typeof item === 'string');

        const native = `beyond/native-bundlers/${this.#is}`;
        !register.includes(native) && register.push(native);

        for (const specifier of register) {
            try {
                const items = require(specifier);
                for (const item of items) {
                    const is = this.#is === 'bundles' ? 'Bundle' : 'Processor';

                    if (typeof item.name !== 'string' || !item.name) {
                        this.#warnings.push(`${is} "${specifier}" is invalid`);
                        continue;
                    }
                    if (this.has(item.name)) {
                        this.#warnings.push(`${is} "${item.name}" is already registered`);
                        continue;
                    }
                    this.set(item.name, item);
                }
            }
            catch (exc) {
                this.#errors.push(`Error registering ${this.#is} of specifier "${specifier}": ${exc.message}`);
            }
        }
    }
}
