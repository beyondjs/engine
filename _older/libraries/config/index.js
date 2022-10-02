const {equal} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.libraries.config';
    }

    #application;
    #value;

    get imports() {
        return this.#value.imports;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    constructor(application, config) {
        super();
        this.#application = application;

        const children = new Map();
        children.set('config', {child: config});
        super.setup(children);
    }

    _process() {
        const config = this.children.get('config').child;
        this.#warnings = config.warnings;

        if (!config.valid) {
            this.#errors = config.errors;
            this.#value = {};
            return;
        }

        const value = Object.assign({}, config.value);
        value.imports = value.imports ? value.imports : [];
        if (!(value.imports instanceof Array)) {
            this.#warnings.push('Invalid excludes configuration');
            value.imports = [];
        }

        if (equal(value, this.#value)) return false;
        this.#value = value;
    }
}
