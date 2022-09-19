module.exports = class {
    #analyzer;

    #sources;
    get sources() {
        return this.#sources;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    /**
     * The analyzer is in sync when its last update was made with the same code of the inputs of its processor
     * and the code of its extensions is up to date.
     * Otherwise, it means that the latest change updates have not yet been received from the child processors.
     * @return {boolean}
     */
    get synchronized() {
        if (!this.updated) return false;

        const {hashes} = this.#analyzer.processor.sources;
        if (!hashes.synchronized) return false;

        for (const [processor, hash] of hashes.extensions) {
            if (hash !== this.#extensions.get(processor)) return false;
        }
        return true;
    }

    /**
     * The analyzer is up to date when its inputs match the last processed
     * @return {boolean}
     */
    get updated() {
        const {hashes} = this.#analyzer.processor.sources;
        return this.#sources === hashes.sources;
    }

    constructor(analyzer) {
        this.#analyzer = analyzer;
    }

    update() {
        const {hashes} = this.#analyzer.processor.sources;
        this.#sources = hashes.sources;
        this.#extensions = new Map(hashes.extensions);
    }

    hydrate(cached) {
        this.#sources = cached.sources;
        this.#extensions = new Map(cached.extensions);
    }

    toJSON() {
        return {sources: this.#sources, extensions: [...this.#extensions]};
    }
}
