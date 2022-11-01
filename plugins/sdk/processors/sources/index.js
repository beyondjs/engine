const Files = require('./files');
const Extensions = require('./extensions');
const Hashes = require('./hashes');

/**
 * Processor sources
 */
module.exports = class {
    #processor;
    get processor() {
        return this.#processor;
    }

    #files;
    get files() {
        return this.#files;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    /**
     * Processor sources constructor
     *
     * @param processor {*}
     * @param specs {{extname: string[] | string, hashes: boolean}} The processor packager
     */
    constructor(processor, {extname, hashes}) {
        this.#processor = processor;

        extname = typeof extname === 'string' ? [extname] : extname;
        if (!(extname instanceof Array)) throw new Error(`Extname specification is invalid`);

        this.#files = new Files(processor, extname);
        this.#extensions = new Extensions(processor);
        this.#hashes = hashes === void 0 || hashes ? new Hashes(this) : void 0;
    }

    configure(path, config) {
        this.#files.configure(path, config);
    }

    destroy() {
        this.#files.destroy();
    }
}
