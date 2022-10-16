const satisfies = require('semver/functions/satisfies.js');
const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {ExternalsRegistryCache} = require('beyond/cache');
const PackageFetcher = require('./fetcher');

module.exports = class Package extends DynamicProcessor() {
    #name;
    #cache;
    #fetcher;

    get fetching() {
        return this.#fetcher.fetching;
    }

    get fetched() {
        return this.#fetcher.fetched;
    }

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

    get filled() {
        return !!this.#versions;
    }

    /**
     * Returns the version of the package that satisfies the required version
     * @param required
     */
    version(required) {
        if (!this.#versions) return;

        const version = this.#versions.find(({version}) => satisfies(version, required));
        return version ? new (require('./vpackage'))(version) : void 0;
    }

    constructor(name) {
        super();
        this.#name = name;
        this.#cache = new ExternalsRegistryCache(name);
        this.#fetcher = new PackageFetcher(name, this.#cache);

        super.setup([['fetcher', {child: this.#fetcher}]]);
    }

    #process(value, time) {
        this.#versions = Object.values(value.versions).reverse();
        this.#time = time;
    }

    async _begin() {
        const cache = this.#cache;
        await cache.load();
        cache.value && this.#process(cache.value);
    }

    #time;

    _process() {
        const {value, time} = this.#fetcher;
        value && time !== this.#time && this.#process(value, time);
    }

    fetch() {
        return this.#fetcher.fetch();
    }
}
