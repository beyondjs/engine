const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors} = require('beyond/bundlers-registry');
const {ProcessorBase} = require('beyond/bundler-helpers');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'application.template.application.processor';
    }

    #cspecs;
    #language;

    #instance;
    get instance() {
        return this.#instance;
    }

    #valid;
    get valid() {
        return this.#valid;
    }

    constructor(config, cspecs, language) {
        super();
        this.#cspecs = cspecs;
        this.#language = language;
        super.setup(new Map([
            ['config', {child: config}],
            ['processors', {child: processors}]
        ]));
    }

    _process() {
        const config = this.children.get('config').child;
        this.#valid = config.valid;
        if (!config.valid) {
            this.#instance?.destroy();
            this.#instance = undefined;
            return;
        }

        const {path, value} = config;
        if (value?.processor === this.#instance?.name) {
            this.#instance?.configure(value);
            return;
        }

        this.#instance?.destroy();
        if (!value?.processor) {
            this.#instance = undefined;
            return;
        }

        const meta = processors.get(value.processor);
        const Processor = meta.Processor ? meta.Processor : ProcessorBase;

        this.#instance = new Processor(value.processor, {
            watcher: config.application.watcher,
            bundle: {
                path: path,
                id: `application//${config.application.id}//template.application`,
                type: 'template/application',
                container: {is: 'application'}
            },
            cspecs: this.#cspecs,
            language: this.#language,
            application: config.application
        });
        this.#instance.configure(value);
    }
}