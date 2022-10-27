const DynamicProcessor = require('beyond/utils/dynamic-processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.pset.hashes.inputs';
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
    #pset = new Map();
    get pset() {
        return this.#pset;
    }

    constructor(pset) {
        super();
        super.setup(new Map([['pset', {child: pset}]]));
    }

    _prepared(require) {
        const pset = this.children.get('pset').child;
        pset.forEach(({hashes}) => require(hashes));
    }

    _process() {
        const pset = this.children.get('pset').child;

        const compute = {};
        this.#pset.clear();
        pset.forEach(({hashes}, name) => {
            compute[name] = hashes.inputs;
            this.#pset.set(name, hashes.input);
        });
        const value = crc32(equal.generate(compute));

        const changed = this.#value !== value;
        this.#value = value;
        return changed;
    }
}
