const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * The processors of a packager
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.processors';
    }

    get id() {
        return this.#packager.id;
    }

    // The bundle packager
    #packager;
    get packager() {
        return this.#packager;
    }

    // The names of the processors supported by the bundler
    #supported;
    #propagator;

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    /**
     * Packager processors constructor
     *
     * @param packager {object} The bundle packager
     */
    constructor(packager) {
        super();

        this.#packager = packager;
        const {bundle} = packager;
        this.#supported = global.bundles.get(bundle.type).bundle.processors;
        if (!(this.#supported instanceof Array)) {
            throw new Error(`Supported processors property is not defined in "${bundle.type}" bundle`);
        }

        this.#propagator = new (require('./propagator'))(this._events);
        this.#hashes = new (require('./hashes'))(this);

        super.setup(new Map([
            ['bundle', {child: bundle}],
            ['global.processors', {child: global.processors}]
        ]));
    }

    _process() {
        let {valid, config} = this.#packager.bundle;
        config = valid && config ? config : {};

        const {multilanguage} = config;
        const reserved = ['imports', 'standalone', 'scoped', 'multilanguage'];

        const updated = new Map();
        const processors = Object.entries(valid && config ? config : {});
        let changed = processors.length !== this.size;

        for (const [name, config] of processors) {
            if (reserved.includes(name)) continue;

            if (this.#supported.includes(name) && !global.processors.has(name)) {
                this.#errors.push(`Processor "${name}" is not registered`);
                continue;
            }
            if (!this.#supported.includes(name)) {
                this.#warnings.push(`Configuration property "${name}" is not supported by the bundle`);
                continue;
            }

            const {bundle, distribution, language} = this.#packager;
            const {container: {application}, watcher} = bundle;
            const packager = this.#packager;
            const specs = {watcher, bundle, packager, distribution, language, application};

            const meta = global.processors.get(name);
            const Processor = meta.Processor ? meta.Processor : global.ProcessorBase;
            const processor = this.has(name) ? this.get(name) : (changed = true) && new Processor(name, specs);

            // Allow the processor to modify the config object without affecting the original configuration
            const cloned = (() => {
                if (typeof config !== 'object') return config;
                if (config instanceof Array) return config.slice();
                return Object.assign({}, config);
            })();
            processor.configure(cloned, multilanguage);
            updated.set(name, processor);
        }

        // Subscribe modules that are new to the collection
        this.#propagator.subscribe([...updated.values()].filter(processor => !this.has(processor.name)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(processor => !updated.has(processor.name)));

        // Destroy unused processors
        this.forEach((processor, name) => !updated.has(name) && processor.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    clear() {
        this.forEach(processor => processor.destroy());
        super.clear();
    }

    destroy() {
        this.clear();
        super.destroy();
    }
}
