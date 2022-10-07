module.exports = class {
    #application;
    #factory;

    constructor(application) {
        this.#application = application;
        this.#factory = new (require('./factory'))(application);
    }

    /**
     * Creates a seeker instance
     *
     * @param specifier {string} The bundle specifier
     * @param distribution {object} The distribution specification
     * @return {object}
     */
    create(specifier, distribution) {
        return new (require('./wrapper'))(this.#factory, this.#application, specifier, distribution);
    }
}
