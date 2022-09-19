const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * The files of an extension.
 * Example: the "svelte" processor extends the "ts" processor.
 * This object would have the "ts" preprocessed files of the "svelte" files.
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.extension.sources';
    }

    #extending;
    get extending() {
        return this.#extending;
    }

    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    get processor() {
        return this.#preprocessor.processor;
    }

    get valid() {
        return this.#preprocessor.valid;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    #files = new Map();
    get files() {
        return this.#files;
    }

    #overwrites = new Map();
    get overwrites() {
        return this.#overwrites;
    }

    /**
     * Processor extension constructor
     *
     * @param extending {string} The name of the processor that is being extended
     * @param preprocessor {object} The preprocessor of the files that extends others processors
     */
    constructor(extending, preprocessor) {
        super();
        this.#extending = extending;
        this.#preprocessor = preprocessor;
        this.#hashes = new (require('./hashes'))(this);

        super.setup(new Map([['preprocessor', {child: preprocessor}]]));
    }

    _process() {
        const {preprocessed, processor} = this.#preprocessor;
        const {distribution} = processor;
        const extending = this.#extending;

        /**
         * Create the source object
         *
         * @param sources {object} The files or overwrites map
         * @param file {string} The file to be set
         * @param extensions {object} The preprocessed extensions of a source
         * @return {object}
         */
        const createSource = (sources, file, extensions) => {
            const extension = extensions.get(extending);
            const source = extension && new (require('./source'))(distribution, extensions.source, extension);
            source && sources.set(file, source);
        }

        this.#files.clear();
        preprocessed.files.forEach((extensions, file) => createSource(this.#files, file, extensions));
        this.#overwrites.clear();
        preprocessed.overwrites.forEach((extensions, file) => createSource(this.#overwrites, file, extensions));
    }
}
