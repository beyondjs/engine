const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.extension.hashes';
    }

    get extension() {
        return this.children.get('extension').child;
    }

    constructor(extension) {
        super();
        super.setup(new Map([['extension', {child: extension}]]));
    }

    /**
     * The root hash is required to avoid invalid compilations due to race conditions
     * Ex: svelte extends ts and sass, then ts or sass are takes different times to compiled
     * once the svelte preprocessed code has been changed.
     * Finally, the svelte compiler must check that the ts and sass compilations are synchronized
     * with the root hash to assure that they are both related with the last svelte preprocessed code
     */
    #root;
    get root() {
        return this.#root;
    }

    get synchronized() {
        const {preprocessor} = this.extension;
        return preprocessor.synchronized && this.#root === preprocessor.hash;
    }

    /**
     * The hash calculated from the preprocessed code of the current extension
     */
    #sources;
    get sources() {
        if (this.#sources !== void 0) return this.#sources;

        const compute = {files: {}, overwrites: {}};
        const {extension} = this;

        let sources;
        if (extension.valid) {
            extension.files.forEach((source, file) => compute.files[file] = source.hashes.preprocessed);
            extension.overwrites.forEach((source, file) => compute.overwrites[file] = source.hashes.preprocessed);
            sources = crc32(equal.generate(compute));
        }
        else {
            sources = 0;
        }
        return this.#sources = sources;
    }

    _process() {
        this.#sources = void 0;
        this.#root = this.extension.preprocessor.hash;
    }
}
