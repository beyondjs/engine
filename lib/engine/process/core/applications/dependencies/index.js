module.exports = class {
    #application;
    #dependencies = new Map();

    #packages;
    get packages() {
        return this.#packages;
    }

    constructor(application) {
        this.#application = application;
        this.#packages = new (require('./packages'))(application);
    }

    get(distribution) {
        const {key} = distribution;
        if (this.#dependencies.has(key)) return this.#dependencies.get(key);

        const dependencies = new (require('./bundles'))(this.#application, distribution);
        this.#dependencies.set(key, dependencies);
        return dependencies;
    }
}
