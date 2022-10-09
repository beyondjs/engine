const DynamicProcessor = require('beyond/utils/dynamic-processor');
const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.bundle.packager.hash';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #value;
    get value() {
        return this.#value;
    }

    constructor(packager) {
        super();
        this.#packager = packager;
        const {bundle, processors} = packager;

        const children = new Map([
            ['bundles', {child: bundle.module.bundles}],
            ['processors.inputs.hash', {child: processors.hashes.inputs}],
            ['deprecated-imports', {child: bundle.imports.hash}]
        ]);

        super.setup(children);
    }

    async _begin() {
        await this.#packager.ready;
    }

    _process() {
        const bundles = this.children.get('bundles').child;
        const imports = this.children.get('deprecated-imports').child;
        const multilanguage = bundles.size > 1 ? 1 : 0;

        const compute = {
            processors: this.children.get('processors.inputs.hash').child.value,
            multilanguage,
            imports: imports.value // The deprecated imports (imports entry in the module.json)
        };
        const value = crc32(equal.generate(compute));
        const changed = this.#value !== value;
        this.#value = value;

        return changed;
    }
}
