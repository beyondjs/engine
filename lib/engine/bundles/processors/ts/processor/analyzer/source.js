module.exports = class extends global.ProcessorAnalyzerSource {
    #bridge;
    get bridge() {
        return this.#bridge;
    }

    /**
     * Analyzer source constructor
     *
     * @param processor {object} The processor object
     * @param distribution {object} The distribution specification
     * @param is {string} Can be 'source' or 'overwrite'
     * @param source {object} Optional. If not specified, the source will be hydrated
     * @param data {{dependencies: object, exports: object, content?: string, bridge?: object}}. Optional
     */
    constructor(processor, distribution, is, source, data) {
        super(processor, distribution, is, source, data);
        this.#bridge = data?.bridge;
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#bridge = cached.bridge ? new Map(cached.bridge) : void 0;
        this.#bridge?.forEach((methods, key) => this.#bridge.set(key, new Map(methods)));
    }

    toJSON() {
        const bridge = (() => {
            if (!this.#bridge) return;
            return [...this.#bridge].map(([key, methods]) => [key, [...methods]]);
        })();

        const json = {bridge};
        return Object.assign(json, super.toJSON());
    }
}
