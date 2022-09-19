const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.preprocessor';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #cache;
    #children;

    #preprocessed;
    get preprocessed() {
        return this.#preprocessed;
    }

    // This hash (the extender root hash) is required to avoid invalid compilations due to race conditions
    // Ex: svelte extends ts and sass, then ts or sass are takes different times to compiled
    // once the svelte preprocessed code has been changed.
    // Finally, the svelte compiler must check that the ts and sass compilations are synchronized
    // with the root hash to assure that they are both related with the last svelte preprocessed code
    #hash;
    get hash() {
        return this.#hash;
    }

    get analyzer() {
        return this.children.get('analyzer')?.child;
    }

    get sources() {
        return {
            files: this.#children.files,
            overwrites: this.#children.overwrites
        };
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    get valid() {
        return this.#diagnostics?.valid;
    }

    get(source, processor) {
        return this.#preprocessed?.get(source, processor);
    }

    has(source, processor) {
        return this.#preprocessed?.has(source, processor);
    }

    /**
     * Processors extender constructor
     *
     * @param processor {object} The processor object
     * @param Children? {Map<string, object>} Can be used when class is overridden
     */
    constructor(processor, Children) {
        super();
        this.#processor = processor;

        this.#cache = new (require('./cache'))(this);
        this.#preprocessed = new (require('./preprocessed'))(processor);

        Children = Children ? Children : require('./children');
        this.#children = new Children(this);

        super.setup(new Map([['hashes', {child: processor.hashes}]]));
    }

    async _begin() {
        const cached = await this.#cache.load();

        // Allow the hydrate method to by async.
        // (The sass processor requires the hydrate method to be async)
        cached && await this.hydrate(cached);
    }

    get updated() {
        const hashes = this.children.get('hashes').child;
        return this.#hash === hashes.sources;
    }

    get synchronized() {
        return this.updated;
    }

    _prepared(require) {
        if (this.updated) return;

        // When the processor is updated, the data is taken from the cache, otherwise the children must be set.
        this.#children.dispose();

        this.sources.files?.forEach(source => require(source));
        this.sources.overwrites?.forEach(source => require(source));
    }

    async _preprocess(preprocessed, diagnostics, request) {
        void (preprocessed);
        void (diagnostics);
        void (request);
        throw new Error('This method must be overridden');
    }

    async _process(request) {
        if (this.updated) return false;

        const preprocessed = new (require('./preprocessed'))(this.#processor);
        const diagnostics = new (require('../../diagnostics'))();

        await this._preprocess(preprocessed, diagnostics, request);
        if (this._request !== request) return;

        this.#preprocessed = preprocessed;
        this.#diagnostics = diagnostics;
        this.#hash = this.children.get('hashes').child.sources;

        this.#cache.save().catch(exc => console.log(exc.stack));
    }

    hydrate(cached) {
        this.#hash = cached.hash;
        this.#diagnostics = new (require('../../diagnostics'))();
        this.#diagnostics.hydrate(cached.diagnostics);
        this.#preprocessed.hydrate(cached.preprocessed);
    }

    toJSON() {
        return {
            hash: this.#hash,
            diagnostics: this.#diagnostics.toJSON(),
            preprocessed: this.#preprocessed.toJSON()
        };
    }
}
