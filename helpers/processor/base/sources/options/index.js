const {fs, crc32} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.sources.options';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #listener;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #content;
    get content() {
        return this.#content;
    }

    #hash;
    get hash() {
        if (this.#hash !== undefined) return this.#hash;
        return this.#hash = this.#content ? crc32(this.#content) : 0;
    }

    #file;

    #listen() {
        const {specs} = this.#processor;
        const {watcher} = specs;
        const {path} = specs.bundle;

        this.#listener?.destroy();
        this.#listener = watcher.listeners.create(path, {includes: [this.#file]});
        this.#listener.listen().catch(exc => console.log(exc.stack));
        this.#listener.on('change', this._invalidate);
    }

    constructor(processor, meta) {
        super();
        if (!meta?.file) throw new Error('Invalid options meta specification');

        this.#processor = processor;
        this.#file = meta.file;

        this.#listen();
    }

    async _process(request) {
        this.#errors = [];
        this.#content = this.#hash = void 0;

        const file = require('path').join(this.#processor.specs.bundle.path, this.#file);
        const exists = file && await fs.exists(file);
        if (request !== this._request) return;

        try {
            const content = exists ? await fs.readFile(file, 'utf8') : void 0;
            if (request !== this._request) return;
            this.#content = content;
        }
        catch (exc) {
            this.#errors.push(`Error reading file: ${exc.message}`);
        }
    }

    destroy() {
        super.destroy();
        this.#listener?.destroy();
    }
}
