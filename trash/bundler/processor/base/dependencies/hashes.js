const {crc32, equal} = global.utils;

module.exports = class {
    #dependencies;

    #sources;
    get sources() {
        return this.#sources;
    }

    #specifiers;
    get specifiers() {
        return this.#specifiers;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    /**
     * The dependencies are in sync when its last update was made with the same code of the sources of its processor
     * and the code of its extensions is up to date.
     * Otherwise, it means that the latest change updates have not yet been received from the child processors.
     * @return {boolean}
     */
    get synchronized() {
        if (!this.updated) return false;

        const {hashes} = this.#dependencies.processor.sources;
        if (!hashes.synchronized) return false;

        for (const [processor, hash] of hashes.extensions) {
            if (hash !== this.#extensions.get(processor)) return false;
        }
        return true;
    }

    /**
     * The dependencies are up to date when its inputs match the last processed
     * @return {boolean}
     */
    get updated() {
        const {hashes} = this.#dependencies.processor.sources;
        return this.#sources === hashes.sources;
    }

    constructor(dependencies) {
        this.#dependencies = dependencies;
    }

    update() {
        const {hashes} = this.#dependencies.processor.sources;
        this.#sources = hashes.sources;
        this.#extensions = new Map(hashes.extensions);

        this.#specifiers = (() => {
            const compute = [];
            this.#dependencies.forEach(dependency => compute.push(dependency.specifier));
            return crc32(equal.generate(compute));
        })();
    }
}
