const {ProcessorCompiledSource} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorCompiledSource {
    #scopeId;
    get scopeId() {
        return this.#scopeId;
    }

    #template;
    get template() {
        return this.#template;
    }

    #templateMap;
    get templateMap() {
        return this.#templateMap;
    }

    constructor(processor, cspecs, is, source, compiled) {
        super(processor, cspecs, is, source, compiled);
        this.#scopeId = compiled?.scopeId;
        this.#template = compiled?.template;
        this.#templateMap = compiled?.templateMap;
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#scopeId = cached.compiled.scopeId;
        this.#template = cached.compiled.template;
        this.#templateMap = cached.compiled.templateMap;
    }
}
