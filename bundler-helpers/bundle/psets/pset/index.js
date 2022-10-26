const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ProcessorBase = require('../../../processor/base');
const registry = require('beyond/bundlers-registry');

/**
 * The processors of a packager
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.pset';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #typecheck;
    get typecheck() {
        return this.#typecheck;
    }

    /**
     * The names of the processors supported by the bundler
     */
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
     * Processors set
     *
     * @param bundle {*}
     * @param platform {string}
     * @param typecheck {boolean}
     */
    constructor(bundle, platform, typecheck) {
        super();

        this.#bundle = bundle;
        this.#platform = platform;
        this.#typecheck = typecheck;

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
        let {valid, config} = this.#bundle;
        config = valid && config ? config : {};

        const reserved = ['imports'];

        const updated = new Map();
        const processors = Object.entries(valid && config ? config : {});
        let changed = processors.length !== this.size;

        for (const [type, config] of processors) {
            if (reserved.includes(type)) continue;

            if (this.#supported.includes(type) && !registry.processors.has(type)) {
                this.#errors.push(`Processor "${type}" is not registered`);
                continue;
            }
            if (!this.#supported.includes(type)) {
                this.#warnings.push(`Configuration property "${type}" is not supported by the bundle`);
                continue;
            }

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
