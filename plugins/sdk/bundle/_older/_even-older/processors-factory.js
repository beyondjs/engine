const registry = require('beyond/bundlers-registry');
const ProcessorBase = require('../../processor/base');

/**
 * Keep a registry of the already created processors instances,
 * to avoid creating the same processor with the same specification more than once
 */
module.exports = class {
    #bundle;
    #instances = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    /**
     * Get a processor instance
     *
     * @param type {string} The processor's type ('ts', 'sass', 'txt', etc)
     * @param platform {string}
     * @param language= {string}
     * @param typecheck {boolean}
     * @return {*} The processor instance
     */
    get(type, platform, language, typecheck) {
        typecheck = !!typecheck;
        const key = `${type}/${platform}` +
            (type === 'ts' ? `/${typecheck}` : '') +
            (language ? `/${language}` : '');

        if (this.#instances.has(key)) return this.#instances.get(key);

        const processor = (() => {
            const meta = registry.processors.get(type);
            const Processor = meta.Processor ? meta.Processor : ProcessorBase;

            const specs = {platform};
            language && (specs.language = language);
            type === 'ts' && (specs.typecheck = !!typecheck);

            return new Processor(type, this.#bundle, specs);
        })();
        this.#instances.set(key, processor);
    }

    destroy() {
        this.#instances.forEach(processor => processor.destroy());
    }
}
