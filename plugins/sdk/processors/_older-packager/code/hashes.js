module.exports = class {
    #code;

    #sources;
    get sources() {
        return this.#sources;
    }

    #inputs;
    get inputs() {
        return this.#inputs;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    constructor(code) {
        this.#code = code;
    }

    /**
     * The code is in sync when its last update was made with the same code of the inputs of its processor
     * and the code of its extensions is up to date.
     * Otherwise, it means that the latest change updates have not yet been received from the child processors.
     * @return {boolean}
     */
    get synchronized() {
        if (!this.updated) return false;

        const {hashes} = this.#code.packager.processor;
        for (const [processorName, extensionHash] of hashes.extensions) {
            if (extensionHash !== this.#extensions.get(processorName)) return false;
        }
        return true;
    }

    /**
     * The code is up to date when its inputs match the last processed
     * @return {boolean}
     */
    get updated() {
        const {hashes} = this.#code.packager.processor;
        return this.#inputs === hashes.inputs;
    }

    update() {
        const {hashes} = this.#code.packager.processor;
        this.#sources = hashes.sources;
        this.#inputs = hashes.inputs;
        this.#extensions = new Map(hashes.extensions);
    }
}
