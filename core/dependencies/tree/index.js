const DynamicProcessor = require('beyond/utils/dynamic-processor');
const DependenciesData = require('./data');
const {DependenciesTreeCache} = require('beyond/stores');
const DependenciesProcessor = require('./processor');
const DependenciesConfig = require('../config');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'dependencies-tree';
    }

    #config;
    get config() {
        return this.#config;
    }

    get hash() {
        return this.#config.hash;
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

    get working() {
        return this.#processor.working;
    }

    get done() {
        return this.#processor.done;
    }

    constructor(config) {
        super();
        if (!(config instanceof DependenciesConfig)) throw new Error('Invalid parameters');

        this.#config = config;
        this.#data = new DependenciesData();
        this.#cache = new DependenciesTreeCache(this);
        this.#processor = new DependenciesProcessor(this);

        super.setup(new Map([['processor', {child: this.#processor}]]));
    }

    async _begin() {
        const cache = this.#cache;
        await cache.load();
        cache.value && cache.value.hash === this.#config.hash && this.#data.hydrate(cache.value);
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
        json.hash = this.#config.hash;
        return json;
    }

    destroy() {
        this.#processor.cancel();
    }
}
