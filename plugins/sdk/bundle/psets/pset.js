const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors: registry} = require('beyond/plugins/registry');

/**
 * The processors of a packager
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'pset';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #config;

    #typecheck;
    get typecheck() {
        return this.#typecheck;
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

    constructor(bundle, typecheck) {
        super();
        this.#bundle = bundle;
        this.#config = bundle.pexport.config;
        this.#typecheck = typecheck;

        super.setup(new Map([
            ['registry', {child: registry}],
            ['config', {child: this.#config}]
        ]));
    }

    _process() {
        // The config
        // Check how to validate configuration
        const config = this.#config;

        return;
        let {valid, config} = this.#bundle;
        config = valid && config ? config : {};

        const updated = new Map();
        const processors = Object.entries(valid && config ? config : {});
        let changed = processors.length !== this.size;

        for (const [type, config] of processors) {
            // if (this.#supported.includes(type) && !registry.processors.has(type)) {
            //     this.#errors.push(`Processor "${type}" is not registered`);
            //     continue;
            // }
            // if (!this.#supported.includes(type)) {
            //     this.#warnings.push(`Configuration property "${type}" is not supported`);
            //     continue;
            // }

            const processor = (() => {
                if (this.has(type)) return this.get(type);

                changed = true;
                const meta = registry.processors.get(type);
                const Processor = meta.Processor ? meta.Processor : ProcessorBase;
                return new Processor(type, this);
            })();

            // Allow the processor to modify the config object without affecting the original configuration
            const cloned = (() => {
                if (typeof config !== 'object') return config;
                if (config instanceof Array) return config.slice();
                return Object.assign({}, config);
            })();
            processor.configure(cloned);
            updated.set(type, processor);
        }

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }

    destroy() {
        super.destroy();
    }
}
