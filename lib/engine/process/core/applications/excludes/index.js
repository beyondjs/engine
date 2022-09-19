const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.excludes';
    }

    #application;
    #value;
    get value() {
        return this.#value;
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
            this.#value = undefined;
            return;
        }

        let value = config.value ? config.value : [];
        if (!(value instanceof Array)) {
            this.#warnings.push('Invalid excludes configuration');
            value = [];
        }

        this.#value = value;
    }

    // Check if a module is excluded in the application
    excludedByConfiguration = module => this.#value.reduce((prev, exclude) => {
        if (!this.processed) throw new Error('Object not processed. Check that await .ready was previously executed.');
        if (prev) return true; // already excluded

        const {pathname} = module;

        // Remove trailing slash
        exclude = exclude.trim().replace(/\/$/, '');

        if (exclude.endsWith('/*')) {
            exclude = exclude.substr(0, exclude.length - 2);
            const relative = require('path').relative(exclude, pathname);
            return !relative.startsWith('../');
        }
        else {
            return exclude === pathname;
        }
    }, false);

    /**
     * Check if module is excluded or not
     * @param module
     * @return {boolean|*} true if the module is excluded
     */
    check(module) {
        if (module.engines && !module.engines.includes(this.#application.engine)) return true;
        return this.excludedByConfiguration(module);
    }
}
