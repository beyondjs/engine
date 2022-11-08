const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Diagnostics = require('../../diagnostics');
const {ProcessorAnalyzerCache} = require('beyond/stores');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'processor.analyzer';
    }

    get AnalyzedSource() {
        return require('./source');
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    get id() {
        return this.#processor.id;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    get valid() {
        return this.diagnostics?.valid;
    }

    #files = new Map();
    get files() {
        return this.#files;
    }

    #extensions = new Map();
    get extensions() {
        return this.#extensions;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    get synchronized() {
        return this.#hashes.synchronized;
    }

    get updated() {
        return this.#hashes.updated;
    }

    #cache;

    constructor(processor) {
        super();
        this.#processor = processor;
        this.#cache = new ProcessorAnalyzerCache(this);
        this.#hashes = new (require('./hashes'))(this);

        super.setup(new Map([['sources.hashes', {child: processor.sources.hashes}]]));
    }

    async _begin() {
        const cached = await this.#cache.load();
        cached && this.hydrate(cached);
    }

    async _analyze(request) {
        void (request);
        throw new Error('Method must be overridden');
    }

    // Method can be overridden
    _finalize() {
    }

    async _process(request) {
        const diagnostics = this.#diagnostics = new Diagnostics();
        const updated = {files: new Map(), extensions: new Map()};

        const {extensions} = this.#processor.sources;
        extensions.valid ? await this._analyze(updated, diagnostics, request) :
            extensions.errors.forEach(error => diagnostics.general.push(error));

        this.files.clear();
        this.extensions.clear();
        updated.files.forEach((value, key) => this.files.set(key, value));
        updated.extensions.forEach((value, key) => this.extensions.set(key, value));

        this.#hashes.update();

        this._finalize();

        // Save the interfaces into cache
        this.#cache.save().catch(exc => console.log(exc.stack));
    }

    hydrate(cached) {
        const hydrate = (cached, is) => {
            const {cspecs} = this.#processor;
            const source = new this.AnalyzedSource(this.#processor, cspecs, is);
            source.hydrate(cached);
            return source;
        }

        // Convert raw data object into source objects
        let {files, extensions, hashes} = cached;
        this.#hashes.hydrate(hashes);

        files = new Map(files);
        files.forEach((cached, key) => files.set(key, hydrate(cached, 'source')));
        files.forEach(source => this.#files.set(source.file, source));

        extensions = new Map(extensions);
        extensions.forEach((cached, key) => extensions.set(key, hydrate(cached, 'extension')));
        extensions.forEach(source => this.#extensions.set(source.file, source));
    }

    toJSON() {
        return {
            hashes: this.#hashes.toJSON(),
            files: [...this.files],
            extensions: [...this.extensions]
        };
    }
}