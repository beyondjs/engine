const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {DependenciesTreeCache} = require('beyond/cache');
const DependenciesProcessor = require('./processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor() {
    #dependencies;
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

    filled() {
        return !!this.#tree;
    }

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;
        this.#cache = new DependenciesTreeCache(dependencies);
        this.#processor = new DependenciesProcessor(dependencies, this.#cache);

        super.setup([['processor', {child: this.#processor}]]);
    }

    #set({value, errors, list}, time) {
        this.#value = value;
        this.#errors = errors;
        this.#list = list;
        this.#time = time;
    }

    async _begin() {
        const cache = this.#cache;
        await cache.load();
        cache.value && this.#hydrate(cache.value);
    }

    #time;

    _process() {
        const {value, errors, list, time} = this.#processor;
        value && time !== this.#time && this.#set({value, errors, list}, time);
    }

    process() {
        return this.#processor.process();
    }
}
