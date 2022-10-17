const DynamicProcessor = require('beyond/utils/dynamic-processor');
const DependenciesData = require('./data');
const {DependenciesTreeCache} = require('beyond/cache');
const DependenciesProcessor = require('./processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor() {
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

    get processing() {
        return this.#processor.processing;
    }

    get processed() {
        return this.#processor.processed;
    }

    get tree() {
        return this.#data.tree;
    }

    get errors() {
        return this.#data.errors;
    }

    get list() {
        return this.#data.list;
    }

    get filled() {
        return !!this.#data.tree;
    }

    constructor(vspecifier, config) {
        super();
        this.#vspecifier = vspecifier;
        this.#config = config;
        this.#data = new DependenciesData();
        this.#cache = new DependenciesTreeCache(this);
        this.#processor = new DependenciesProcessor(this);
        this.#hash = crc32(equal.generate(config));

        super.setup([['processor', {child: this.#processor}]]);
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

        this.#value = value;
        this.#data.hydrate(value);
        this.#time = time;
        this.#cache.save();
    }

    async process() {
        await this.#processor.process();
    }

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
