const fs = require('beyond/utils/fs');
const DynamicProcessor = require('beyond/utils/dynamic-processor');
const crc32 = require('beyond/utils/crc32');

module.exports = class extends DynamicProcessor() {
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
        const {watcher} = this.#processor;
        if (!watcher) return;

        const {path} = this.#processor.module;

        this.#listener?.destroy();
        this.#listener = watcher.listeners.create(path, {includes: [this.#file]});
        this.#listener.listen().catch(exc => console.log(exc.stack));
        this.#listener.on('change', this._invalidate);
    }

    constructor(processor, {file}) {
        super();
        if (!file) throw new Error('Invalid options meta specification');

        this.#processor = processor;
        this.#file = file;

        this.#listen();
    }

    async _process(request) {
        this.#errors = [];
        this.#content = this.#hash = void 0;

        const file = require('path').join(this.#processor.specs.bundle.path, this.#file);
        const exists = file && await fs.exists(file);
        if (this.cancelled(request)) return;

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
