const DynamicProcessor = require('beyond/utils/dynamic-processor');
const DependenciesData = require('./data');
const {DependenciesTreeCache} = require('beyond/cache');
const DependenciesProcessor = require('./processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'dependencies-tree';
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #config;
    get config() {
        return this.#config;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #data;
    #cache;
    #processor;

    get list() {
        return this.#data.list;
    }

    get errors() {
        return this.#data.errors;
    }

    get valid() {
        return !this.errors?.length;
    }

    get filled() {
        return !!this.#data.tree;
    }

    get processing() {
        return this.#processor.processing;
    }

    get processed() {
        return this.#processor.processed;
    }

    constructor(vspecifier, config) {
        super();
        this.#vspecifier = vspecifier;
        this.#config = config;
        this.#data = new DependenciesData();
        this.#cache = new DependenciesTreeCache(this);
        this.#processor = new DependenciesProcessor(this);
        this.#hash = crc32(equal.generate(config));

        super.setup(new Map([['processor', {child: this.#processor}]]));
    }

    async _begin() {
        const cache = this.#cache;
        await cache.load();
        cache.value && cache.value.hash === this.#hash && this.#data.hydrate(cache.value);
    }

    #time;

    _process() {
        const {value, time} = this.#processor;
        if (time === this.#time) return;

        this.#data.hydrate(value);
        this.#time = time;
        this.#cache.save();

        this.clear();
        this.#data.tree.forEach((value, specifier) => this.set(specifier, value));
    }

    async process() {
        await this.#processor.process();
    }

    /**
     * Load from cache, if cache is not updated, then make the process
     * @return {Promise<void>}
     */
    async fill() {
        await this.ready;
        !this.filled && await this.process();
    }

    toJSON() {
        const json = this.#data.toJSON();
        json.hash = this.#hash;
        return json;
    }

    destroy() {
        this.#processor.cancel();
    }
}
