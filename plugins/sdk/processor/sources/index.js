const Files = require('./files');
const Extensions = require('./extensions');

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

    #options;
    get options() {
        return this.#options;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    /**
     * Processor sources constructor
     *
     * @param processor {object} The processor packager
     */
    constructor(processor) {
        this.#processor = processor;

        if (!processor.meta.sources) throw new Error(`Processor sources specification must be defined`);
        let {extname} = processor.meta.sources;
        extname = typeof extname === 'string' ? [extname] : extname;
        if (!(extname instanceof Array)) throw new Error(`Processor extname sources specification is invalid`);

        this.#files = new Files(processor, extname);
        this.#extensions = new Extensions(processor);

        const {options} = processor.meta;
        const Options = options ? (options.Options ? options.Options : require('./options')) : void 0;
        this.#options = Options ? new Options(processor, options) : void 0;

        let {Hashes} = processor.meta.sources;
        Hashes = Hashes ? Hashes : require('./hashes');
        this.#hashes = new Hashes(this);
    }

    configure(path, config) {
        this.#files.configure(path, config);
    }

    destroy() {
        this.#files.destroy();
        this.#options?.destroy();
    }
}
