/**
 * The registry is created in lib/client/process/core/index.js,
 * and exposed globally in lib/client/process/core/global/index.js
 */
module.exports = new class {
    #created = false;
    #registries;

    get bundles() {
        return this.#registries?.bundles;
    }

    get processors() {
        return this.#registries?.processors;
    }

    create(config) {
        if (this.#created) throw new Error('Bundler registries already created');
        this.#created = true;

        this.#registries = new (require('./registries'))(config);
    }
}
