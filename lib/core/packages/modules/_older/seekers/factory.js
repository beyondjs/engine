module.exports = class extends Map {
    #application;
    #seekers = new Map();

    /**
     * Seekers factory constructor
     *
     * @param application {object} The application object
     */
    constructor(application) {
        super();
        this.#application = application;
    }

    /**
     * Returns a seeker that is responsible to find the module
     *
     * @param wrapper {object} The seeker wrapper that is requiring the seeker
     * @return {object} The seeker of the specifier
     */
    obtain(wrapper) {
        const {specifier, distribution} = wrapper;
        const key = `${specifier}//${distribution.key}`;

        // Register the wrapper that is requiring the bundle specifier
        const wrappers = this.has(key) ? super.get(key) : new Set();
        this.set(key, wrappers);
        wrappers.add(wrapper);

        const seeker = this.#seekers.has(key) ? this.#seekers.get(key) :
            new (require('./seeker'))(this.#application, specifier, distribution);
        this.#seekers.set(key, seeker);
        return seeker;
    }

    release(wrapper) {
        const {specifier, distribution} = wrapper;
        const key = `${specifier}//${distribution.key}`;

        if (!this.has(key)) {
            throw new Error(`There are no wrappers registered for the specifier specifier "${specifier}"`);
        }

        const wrappers = this.get(key);
        if (!wrappers.has(wrapper)) {
            throw new Error('Consumer is not in the registry list');
        }

        wrappers.delete(wrapper);
        if (wrappers.size) return;

        // There were no wrappers left for the specifier
        this.delete(key);

        const seeker = this.#seekers.get(key);
        this.#seekers.delete(key);
        seeker.destroy();
    }
}
