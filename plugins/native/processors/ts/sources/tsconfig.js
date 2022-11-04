const {SourcesFile} = require('beyond/plugins/sdk');
const fs = require('beyond/utils/fs');
const crc32 = require('beyond/utils/crc32');

module.exports = class extends SourcesFile() {
    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
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

    constructor(processor) {
        super(processor, {file: 'tsconfig.json'});
    }

    async _process(request) {
        const errors = [];
        this.#content = this.#hash = void 0;

        const file = require('path').join(this.processor.specs.bundle.path, this.#file);
        const exists = file && await fs.exists(file);
        if (this.cancelled(request)) return;

        try {
            const content = exists ? await fs.readFile(file, 'utf8') : void 0;
            if (this.cancelled(request)) return;

            this.#content = JSON.parse(content);
        }
        catch (exc) {
            errors.push(exc.message);
        }

        this.#errors = errors;
    }
}
