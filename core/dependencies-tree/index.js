const DynamicProcessor = require('beyond/utils/dynamic-processor');
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

    #cache;
    #processor;

    get processing() {
        return this.#processor.processing;
    }

    get processed() {
        return this.#processor.processed;
    }

    #tree;
    get tree() {
        return this.#tree;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    #list;
    get list() {
        return this.#list;
    }

    get filled() {
        return !!this.#tree;
    }

    constructor(vspecifier, config) {
        super();
        this.#vspecifier = vspecifier;
        this.#config = config;
        this.#cache = new DependenciesTreeCache(this);
        this.#processor = new DependenciesProcessor(this);

        super.setup([['processor', {child: this.#processor}]]);
    }

    async _begin() {
        const cache = this.#cache;
        await cache.load();
        cache.value && this.#hydrate(cache.value);
    }

    #time;

    _process() {
        const {value, time} = this.#processor;
        if (time === this.#time) return;

        this.#value = value;
        this.#time = time;
        this.#cache.save();
    }

    process() {
        this.#processor.process();
    }

    toJSON() {
        return this.#data.toJSON();
    }

    destroy() {
        this.#processor.cancel();
    }
}
