const DynamicProcessor = require('beyond/utils/dynamic-processor');
const packages = require('beyond/packages');
const DependenciesTree = require('beyond/dependencies-tree');
const equal = require('beyond/utils/equal');
const crc32 = require('beyond/utils/crc32');

module.exports = class extends DynamicProcessor(Map) {
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
        super.setup(new Map([['package', {child: pkg}], ['packages', {child: packages}]]));
    }

    _prepared(require) {
        if (!this.#config) return false;
        if (this.#tree?.hash === this.#hash) return;

        this.#tree && this.children.unregister(['tree']);
        this.#tree?.destroy();

        const child = this.#tree = new DependenciesTree(this.#pkg.vspecifier, this.#config);
        this.children.register(new Map([['tree', {child}]]));

        packages.forEach(pkg => require(pkg));
    }

    _process() {
        const done = (installed, updated) => {
            const changed = this.#tree.hash !== this.#hash || this.#installed !== installed;

            this.#installed = installed;
            this.clear();
            updated?.forEach((value, key) => this.set(key, value));

            return changed;
        }

        if (!this.#tree.filled) return done(false);

        let installed = true;
        const updated = new Map();
        [...this.#tree.list.keys()].forEach(vspecifier => {
            const dependency = packages.find({vspecifier});
            installed = installed && !!dependency;
            updated.set(vspecifier, dependency);
        });

        return done(installed, updated);
    }

    configure(config) {
        this.#config = typeof config === 'object' ? config : {};
        this.#hash = crc32(equal.generate(this.#config));
        this._invalidate();
    }
}
