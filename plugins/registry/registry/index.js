const DynamicProcessor = require('beyond/utils/dynamic-processor');
const equal = require('beyond/utils/equal');

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
        if (!['plugins', 'processors'].includes(is)) throw new Error('Invalid parameters');

        this.#is = is;
        super.setup(new Map([['config', {child: config}]]));
    }

    _process() {
        const done = ({errors, warnings, updated}) => {
            errors = errors ? errors : [];
            warnings = warnings ? warnings : [];
            let changed = !equal(this.#errors, errors) || !equal(this.#warnings, warnings);

            this.#errors = errors;
            this.#warnings = warnings;

            this.clear();
            changed = changed || this.size !== updated?.size;
            updated?.forEach((Item, name) => {
                changed = changed || !this.has(name);
                this.set(name, Item);
            });

            return changed;
        }

        let {valid, value: config, errors, warnings} = this.children.get('config').child;
        if (!valid) return done({errors, warnings});

        const updated = new Map();
        warnings = warnings.slice();

        for (const specifier of config) {
            try {
                const required = require(specifier);
                if (typeof required !== 'object') {
                    warnings.push(`Error registering "${specifier}": invalid exported values`);
                    continue;
                }

                const {warning, items} = (() => {
                    let items = required[this.#is];
                    const is = this.#is === 'plugins' ? 'Plugins' : 'Processors';

                    if (!(items instanceof Array)) return {warning: `${is} configuration of "${specifier}" is invalid`};
                    items = items ? items.filter(item => typeof item === 'string') : [];
                    return {items};
                })();
                warning && warnings.push(warning);

                if (!(items instanceof Map)) continue;
                items.forEach((Item, name) => updated.set(name, Item));
            }
            catch (exc) {
                console.log(exc.stack);
                warnings.push(`Error registering "${specifier}": ${exc.message}`);
            }
        }

        return done({updated});
    }
}
