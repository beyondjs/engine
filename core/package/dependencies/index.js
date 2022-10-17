const DynamicProcessor = require('beyond/utils/dynamic-processor');
const installs = require('beyond/externals/installs');
const DependenciesTree = require('beyond/dependencies-tree');
const equal = require('beyond/utils/equal');
const crc32 = require('beyond/utils/crc32');

module.exports = class extends DynamicProcessor() {
    #pkg;
    #tree;
    #config;
    #hash;

    #installed;
    get installed() {
        return this.#installed;
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;
        super.setup(new Map([['package', {child: pkg}], ['installs', {child: installs}]]));
    }

    _process() {
        const done = installed => {
            const changed = this.#installed === installed;
            this.#installed = installed;
            return changed;
        }

        if (!this.#tree.filled) return done(false);

        const {list} = this.#tree;
        const installed = [...list.keys()].reduce((vspecifier, prev) => prev && installs.has(vspecifier), true);
        return done(installed);
    }

    _prepared() {
        if (!this.#config) return false;
        if (this.#tree?.hash === this.#hash) return;

        this.#tree && this.children.unregister(['tree']);
        this.#tree?.destroy();

        const child = this.#tree = new DependenciesTree(this.#pkg.vspecifier, this.#config);
        this.children.register(new Map([['tree', {child}]]));
    }

    configure(config) {
        this.#config = typeof config === 'object' ? config : {};
        this.#hash = crc32(equal.generate(this.#config));
        this._invalidate();
    }
}
