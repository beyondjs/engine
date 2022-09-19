const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.template.global.processor';
    }

    #distribution;
    #language;

    #instance;
    get instance() {
        return this.#instance;
    }

    #valid;
    get valid() {
        return this.#valid;
    }

    constructor(config, distribution, language) {
        super();
        this.#distribution = distribution;
        this.#language = language;
        super.setup(new Map([
            ['config', {child: config}],
            ['global.processors', {child: global.processors}]
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

        const meta = global.processors.get(value.processor);
        const Processor = meta.Processor ? meta.Processor : global.ProcessorBase;

        this.#instance = new Processor(value.processor, {
            watcher: config.application.watcher,
            bundle: {
                path: path,
                id: `application//${config.application.id}//template.global`,
                type: 'template/global',
                container: {is: 'application'}
            },
            distribution: this.#distribution,
            language: this.#language,
            application: config.application
        });
        this.#instance.configure(value);
    }
}
