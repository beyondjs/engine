const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc} = global.utils;
const Diagnostics = (require('../../diagnostics'));
const Meta = (require('./meta'));

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'packager.compiler';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    get id() {
        return this.#packager.id;
    }

    get dependencies() {
        return this.#packager.processor.dependencies;
    }

    get specs() {
        return this.#packager.processor.specs;
    }

    #CompiledSource = require('../../source/compiled');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    get analyzer() {
        return this.#children.analyzer;
    }

    get options() {
        return this.#children.options;
    }

    get sources() {
        return {
            files: this.#children.files,
            extensions: this.#children.extensions,
            overwrites: this.#children.overwrites
        };
    }

    get extended() {
        return this.#children.extended;
    }

    #files = new Map();
    get files() {
        return this.#files;
    }

    #extensions = new Map();
    get extensions() {
        return this.#extensions;
    }

    #overwrites = new Map();
    get overwrites() {
        return this.#overwrites;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    get valid() {
        return this.#diagnostics.valid;
    }

    #cache;
    #children;

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

    get path() {
        const {files} = this.#packager.sources;
        return files.path;
    }

    _notify() {
        let [processorId, distributionId] = this.id.split('///');
        let id = processorId.split('//');
        id = id.slice(0, id.length - 2).join('//');

        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'packagers-compilers',
            id: `${id}///${distributionId}`
        });
    }

    constructor(packager, Children) {
        super();
        this.#packager = packager;

        Children = Children ? Children : require('./children');
        this.#children = new Children(this);
        this.#hashes = new (require('./hashes'))(this);
        this.#cache = new (require('./cache'))(this);

        super.setup(new Map([['processor.hashes', {child: packager.processor.hashes}]]));
    }

    async _begin() {
        const cached = await this.#cache.load();

        // Allow the hydrate method to by async.
        // (The sass processor requires the hydrate method to be async)
        cached && await this.hydrate(cached);
    }

    _prepared(require) {
        const ph = this.children.get('processor.hashes').child;
        if (!ph.synchronized) return 'processor hashes are not synchronized';

        if (this.updated && !this.#children.disposed) return;

        // When the processor is updated, the data is taken from the cache, otherwise the children must be set.
        this.#children.dispose();

        this.sources.files?.forEach(source => require(source));
        this.sources.overwrites?.forEach(source => require(source));

        const {analyzer, dependencies, extended} = this;
        if (analyzer && (!require(analyzer) || !analyzer.synchronized)) return 'analyzer is not synchronized';
        if (dependencies && (!require(dependencies) || !dependencies.synchronized)) return 'dependencies are not synchronized';
        if (extended && (!require(extended) || !extended.synchronized)) return 'extended compilers are not synchronized';

        dependencies?.forEach(dependency => require(dependency));
    }

    async _process(request) {
        const {processor} = this.#packager;
        if (this.updated) {
            this.#hashes.update();

            // It is not required to update the compilation code, but the root hashes have changed
            this.#cache.save().catch(exc => console.log(exc.stack));
            return {notify: false};
        }

        const meta = new Meta();
        const diagnostics = new Diagnostics();
        const updated = {files: new Map(), extensions: new Map(), overwrites: new Map()};

        const done = () => {
            this.#hashes.update();
            this.#meta = meta;
            this.#diagnostics = diagnostics;

            this.#files.clear();
            this.#extensions.clear();
            this.#overwrites.clear();
            updated.files.forEach((value, key) => this.#files.set(key, value));
            updated.extensions.forEach((value, key) => this.#extensions.set(key, value));
            updated.overwrites.forEach((value, key) => this.#overwrites.set(key, value));

            // Save the new compilation into cache
            this.#cache.save().catch(exc => console.log(exc.stack));
        }

        const {extender} = processor;
        if (extender && !extender?.preprocessor.valid) {
            diagnostics.set(extender.preprocessor.diagnostics);
            return done();
        }

        if (!processor.valid) {
            diagnostics.set({general: processor.errors});
            return done();
        }

        if (this.options && !this.options.valid) {
            diagnostics.set({general: this.options.errors});
            return done();
        }

        if (this.analyzer && !this.analyzer.valid) {
            diagnostics.set(this.analyzer.diagnostics);
            return done();
        }

        if (this.extended && !this.extended.valid) {
            this.extended.errors.forEach(error => diagnostics.general.push(error));
            return done();
        }

        // Check for errors in the dependencies before trying to compile
        const errors = (() => {
            const {dependencies} = this;
            if (!dependencies) return [];

            if (!dependencies.valid) {
                dependencies.errors.forEach(error => diagnostics.general.push(error));
                return done();
            }

            const errors = [];
            dependencies.forEach(({specifier, valid}) => !valid && errors.push(`Dependency "${specifier}" is invalid`));
            return errors;
        })();
        if (errors.length) {
            errors.forEach(error => diagnostics.general.push(error));
            return done();
        }

        await this._compile(updated, diagnostics, meta, request);
        if (request !== this._request) return;

        done();
    }

    // Hydrate from cache
    hydrate(cached) {
        // Convert raw data object into source objects
        let {hashes, files, extensions, overwrites, diagnostics, meta} = cached;

        this.#hashes.hydrate(hashes);

        const hydrate = (is, cached) => {
            const {processor, distribution} = this.#packager;
            const source = new this.CompiledSource(processor, distribution, is);
            source.hydrate(cached);
            return source;
        }

        files = new Map(files);
        files.forEach((cached, key) => files.set(key, hydrate('source', cached)));
        files.forEach((source, key) => this.#files.set(key, source));

        extensions = new Map(extensions);
        extensions.forEach((cached, key) => extensions.set(key, hydrate('source', cached)));
        extensions.forEach((source, key) => this.#extensions.set(key, source));

        overwrites = new Map(overwrites);
        overwrites.forEach((cached, key) => overwrites.set(key, hydrate('overwrite', cached)));
        overwrites.forEach((source, key) => this.#overwrites.set(key, source));

        this.#diagnostics = new Diagnostics();
        this.#diagnostics.hydrate(diagnostics);

        this.#meta = new Meta();
        this.#meta.hydrate(meta);
    }

    toJSON() {
        const {files, extensions, overwrites} = this;
        const diagnostics = this.diagnostics.toJSON();
        const meta = this.meta;

        return {
            hashes: this.#hashes.toJSON(),
            files: [...files],
            extensions: [...extensions],
            overwrites: [...overwrites],
            diagnostics,
            meta
        };
    }
}
