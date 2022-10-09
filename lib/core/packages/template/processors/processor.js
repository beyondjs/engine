const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors} = require('beyond/bundlers-registry');
const {ProcessorBase} = require('beyond/bundler-helpers');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'application.template.processors.processor';
    }

    #name;
    get name() {
        return this.#name
    }

    #valid;
    get valid() {
        return this.#valid;
    }

    #cspecs;
    #language;

    #instance;
    get instance() {
        return this.#instance;
    }

    constructor(name, config, cspecs, language) {
        super();
        this.#name = name;
        this.#cspecs = cspecs;
        this.#language = language;
        super.setup(new Map([
            ['config', {child: config}],
            ['processors', {child: processors}]
        ]));
        this.setMaxListeners(500);
    }

    _process() {
        const config = this.children.get('config').child;
        this.#valid = config.valid;
        if (!config.valid) {
            this.#instance?.destroy();
            this.#instance = undefined;
            return;
        }

        let {path, value} = config;
        value = value?.[this.#name];
        if (this.#instance && this.#instance.path === path) {
            value ? this.#instance.configure(value) : this.#instance.destroy();
            !value && (this.#instance = undefined);
            return;
        }

        this.#instance?.destroy();
        this.#instance = undefined;
        if (!value) return;

        const meta = processors.get(this.#name);
        const Processor = meta.Processor ? meta.Processor : ProcessorBase;
        this.#instance = new Processor(this.#name, {
            watcher: config.application.watcher,
            bundle: {
                path: path,
                id: `application//${config.application.id}//template.processors/${this.#name}`,
                type: `template/processors/${this.#name}`,
                container: {is: 'application'}
            },
            cspecs: this.#cspecs,
            language: this.#language,
            application: config.application
        });
        this.#instance.configure(value);
    }
}
