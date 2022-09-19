/**
 * All the active processors
 * Actually it is not being used, it is here to be used when required in future requirements
 */
module.exports = new class {
    #instances = new Set();

    register(dp) {
        this.#instances.add(dp);
    }

    delete(dp) {
        this.#instances.delete(dp);
    }
}
