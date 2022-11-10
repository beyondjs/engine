const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {Config} = require('beyond/utils/config');
const Application = require('./application');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'applications.config';
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

    #config;

    /**
     * ApplicationSpecs config constructor
     *
     * @param path {string} The path where the beyond.json is located
     */
    constructor(path) {
        super();

        this.#config = (() => {
            const main = new Config(path, {'/applications': 'array'});
            main.data = 'beyond.json';
            return main.properties.get('applications');
        })();

        super.setup(new Map([['config', {child: this.#config}]]));
    }

    _prepared(require) {
        this.#config.items.forEach(appConfig => require(appConfig));
    }

    _process() {
        const {errors, warnings, items} = this.#config;
        this.#errors = errors.slice();
        this.#warnings = warnings.slice();

        this.clear();
        items.forEach(config => {
            const application = new Application(config);
            this.set(0, application);
        });
    }
}
