const satisfies = require('semver/functions/satisfies.js');
const fetch = require('node-fetch');
const {PendingPromise} = require('uimport/utils');

module.exports = class Package {
    #name;
    #cache;

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    /**
     * The versions of the package ordered by published date
     */
    #versions;
    get versions() {
        return this.#versions;
    }

    /**
     * Returns the version of the package that satisfies the required version
     * @param required
     */
    version(required) {
        const version = this.#versions.find(({version}) => satisfies(version, required));
        return version ? new (require('./vpackage'))(version) : void 0;
    }

    constructor(name, cache) {
        this.#name = name;
        this.#cache = cache;
    }

    #promise;

    async fetch() {
        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();

        const done = ({json, error}) => {
            if (error) {
                this.#error = error;
                return {error};
            }

            this.#versions = Object.values(json.versions).reverse();

            this.#promise.resolve({json});
            return {json};
        }

        const cached = await this.#cache.load(this.#name);
        if (cached) return done(cached);

        const response = await fetch(`https://registry.npmjs.org/${this.#name}`);
        if (!response.ok) return done({error: response.status});

        const json = await response.json();
        await this.#cache.save(this.#name, {json});
        return done({json});
    }
}
