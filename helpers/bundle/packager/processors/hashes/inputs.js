const {equal, crc32} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.processors.hashes.inputs';
    }

    /**
     * The value of the hash calculated from the inputs of each processor
     */
    #value;
    get value() {
        return this.#value;
    }

    /**
     * The value of the inputs hashes of each processor
     * @type {Map<string, number>}
     */
    #processors = new Map();
    get processors() {
        return this.#processors;
    }

    constructor(processors) {
        super();
        super.setup(new Map([['processors', {child: processors}]]));
    }

    _prepared(require) {
        const processors = this.children.get('processors').child;
        processors.forEach(({hashes}) => require(hashes));
    }

    _process() {
        const processors = this.children.get('processors').child;

        const compute = {};
        this.#processors.clear();
        processors.forEach(({hashes}, name) => {
            compute[name] = hashes.inputs;
            this.#processors.set(name, hashes.input);
        });
        const value = crc32(equal.generate(compute));

        const changed = this.#value !== value;
        this.#value = value;
        return changed;
    }
}
