const DynamicProcessor = require('beyond/utils/dynamic-processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor() {
    #dependencies;

    #value;
    get value() {
        return this.#value;
    }

    constructor(dependencies) {
        super();
        this.#dependencies = dependencies;

        super.setup(new Map([['dependencies', {child: dependencies}]]));
    }

    _process() {
        const value = (() => {
            const dependencies = this.#dependencies;

            const compute = [`imports:${dependencies.imports.hash}`];
            dependencies.forEach(dependency => compute.push(dependency.specifier));
            return crc32(equal.generate(compute));
        })();

        const changed = this.#value !== value;
        this.#value = value;
        return changed;
    }
}
