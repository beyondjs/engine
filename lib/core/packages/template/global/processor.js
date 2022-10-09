const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {ProcessorBase} = require('beyond/bundler-helpers');
const {processors} = require('beyond/bundlers-registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'application.template.global.processor';
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
                id: `application//${config.application.id}//template.global`,
                type: 'template/global',
                container: {is: 'application'}
            },
            cspecs: this.#cspecs,
            language: this.#language,
            application: config.application
        });
        this.#instance.configure(value);
    }
}
