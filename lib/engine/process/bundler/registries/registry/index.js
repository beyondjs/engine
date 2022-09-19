const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
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
        let {path, valid, value, errors, warnings} = this.children.get('config').child;

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
        register = register.map(item => require('path').resolve(path, item));

        const native = require('path').join(global.lib, `client/bundles/${this.#is}`);
        !register.includes(native) && register.push(native);

        for (const path of register) {
            try {
                const items = require(path);
                for (const item of items) {
                    if (typeof item.name !== 'string' || !item.name) {
                        this.#warnings.push(`Item name is invalid on path "${path}"`);
                        continue;
                    }
                    if (this.has(item.name)) {
                        this.#warnings.push(`Item "${item.name}" is already registered`);
                        continue;
                    }
                    this.set(item.name, item);
                }
            }
            catch (exc) {
                this.#errors.push(`Error registering items of path "${path}": ${exc.message}`);
            }
        }
    }
}
