const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors: registry} = require('beyond/plugins/registry');

/**
 * The processors of a packager
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'processors-set';
    }

    #conditional;
    get conditional() {
        return this.#conditional;
    }

    constructor(conditional) {
        super();
        this.#conditional = conditional;

        super.setup(new Map([
            ['registry', {child: registry}],
            ['config', {child: conditional.config}]
        ]));
    }

    _process() {
        // The config
        // Check how to validate configuration
        const {value: config, valid} = this.#conditional.config;

        let changed = false;
        const updated = new Map();

        config.processors.forEach((config, name) => {
            const processor = (() => {
                if (this.has(name)) return this.get(name);
                changed = true;
                const Processor = registry.get(name);
                return new Processor(this);
            })();

            // Allow the processor to modify the config object without affecting the original configuration
            const cloned = (() => {
                if (typeof config !== 'object') return config;
                if (config instanceof Array) return config.slice();
                return Object.assign({}, config);
            })();

            processor.configure(cloned);
            updated.set(name, processor);
        });

        this.forEach((processor, name) => !updated.has(name) && (changed = true) && processor.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
        return changed;
    }

    destroy() {
        super.destroy();
    }
}