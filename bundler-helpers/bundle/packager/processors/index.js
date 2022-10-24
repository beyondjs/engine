const DynamicProcessor = require('beyond/utils/dynamic-processor');
const registry = require('beyond/bundlers-registry');
const ProcessorBase = require('../../../processor/base');

/**
 * The processors of a packager
 */
module.exports = class extends DynamicProcessor(Map) {
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
        this.#supported = registry.bundles.get(bundle.type).bundle.processors;
        if (!(this.#supported instanceof Array)) {
            throw new Error(`Supported processors property is not defined in "${bundle.type}" bundle`);
        }

        this.#hashes = new (require('./hashes'))(this);

        super.setup(new Map([
            ['bundle', {child: bundle}],
            ['processors', {child: registry.processors}]
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

            if (this.#supported.includes(name) && !registry.processors.has(name)) {
                this.#errors.push(`Processor "${name}" is not registered`);
                continue;
            }
            if (!this.#supported.includes(name)) {
                this.#warnings.push(`Configuration property "${name}" is not supported by the bundle`);
                continue;
            }

            const {bundle, cspecs, language} = this.#packager;
            const {module: {pkg}, watcher} = bundle;
            const packager = this.#packager;
            const specs = {pkg, watcher, bundle, packager, cspecs, language};

            const meta = registry.processors.get(name);
            const Processor = meta.Processor ? meta.Processor : ProcessorBase;
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
