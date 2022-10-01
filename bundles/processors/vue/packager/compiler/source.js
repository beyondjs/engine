module.exports = class extends global.ProcessorCompiledSource {
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

    constructor(processor, distribution, is, source, compiled) {
        super(processor, distribution, is, source, compiled);
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
