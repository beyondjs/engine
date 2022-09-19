const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.transversal.packager.hash';
    }

    // The transversal packager
    #value;
    get value() {
        return this.#value;
    }

    /**
     * Transversal packager hash constructor
     *
     * @param packagers {object} The packagers of the modules and libraries of the application
     */
    constructor(packagers) {
        super();
        super.setup(new Map([['packagers', {child: packagers}]]));
    }

    _prepared(require) {
        const packagers = this.children.get('packagers').child;
        packagers.forEach(packager => require(packager.hash));
    }

    _process() {
        const packagers = this.children.get('packagers').child;
        const hashes = {};
        packagers.forEach((packager, path) => hashes[path] = packager.hash.value);

        const value = crc32(equal.generate(hashes));
        const changed = value !== this.#value;
        this.#value = value;
        return changed;
    }
}
