module.exports = class {
    #processor;
    #available = new Set();

    #files = new Map();
    get files() {
        return this.#files;
    }

    #overwrites = new Map();
    get overwrites() {
        return this.#overwrites;
    }

    constructor(processor) {
        this.#processor = processor;

        const {meta} = processor;
        const {extends: _extends} = meta.extender;
        _extends.forEach(processor => this.#available.add(processor));
    }

    _getSources(source) {
        const {is} = source;
        if (!['source', 'overwrite'].includes(is)) throw new Error(`Invalid source.is "${is}" property`);
        return is === 'source' ? this.#files : this.#overwrites;
    }

    has(source, processor) {
        if (processor && !this.#available.has(processor)) {
            throw new Error(`Processor "${processor}" is not being extended`);
        }

        const sources = this._getSources(source);
        const {file} = source.relative;

        const extensions = sources.get(file);
        return processor ? extensions.has(processor) : !!extensions;
    }

    get(source, processor) {
        if (processor && !this.#available.has(processor)) {
            throw new Error(`Processor "${processor}" is not being extended`);
        }

        const sources = this._getSources(source);
        const {file} = source.relative;

        const extensions = sources.get(file);
        return processor ? extensions.get(processor) : extensions;
    }

    set(source, values) {
        const sources = this._getSources(source);
        const {file} = source.relative;

        const extensions = sources.has(file) ?
            sources.get(file) : new (require('./extensions'))(this.#processor, 'source', source);
        extensions.set(values);
        sources.set(file, extensions);
    }

    overwrite(source, extensions) {
        const sources = this._getSources(source);
        const {file} = source.relative;

        sources.set(file, extensions);
    }

    hydrate(cached) {
        const hydrateExtensions = (sources, file, cached) => {
            const extensions = new (require('./extensions'))(this.#processor);
            extensions.hydrate(cached);
            sources.set(file, extensions);
        }

        this.#files = new Map(cached.files);
        this.#files.forEach((cached, file) => hydrateExtensions(this.#files, file, cached));

        this.#overwrites = new Map(cached.overwrites);
        this.#overwrites.forEach((cached, file) => hydrateExtensions(this.#overwrites, file, cached));
    }

    toJSON() {
        return {files: [...this.#files], overwrites: [...this.#overwrites]};
    }
}
