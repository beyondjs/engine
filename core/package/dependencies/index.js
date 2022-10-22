const DynamicProcessor = require('beyond/utils/dynamic-processor');
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

    get list() {
        return this.#tree?.list;
    }

    get filled() {
        return this.#tree?.filled;
    }

    get errors() {
        return this.#tree?.errors;
    }

    get valid() {
        return !this.errors?.length;
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        // Do not require beyond/packages at the top of the file to avoid a circular dependency
        const packages = require('beyond/packages');
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
        const done = (installed) => {
            const changed = this.#tree.hash !== this.#hash || this.#installed !== installed;
            this.#installed = installed;
            return changed;
        }

        this.clear();
        if (!this.#tree.filled) return done(false);

        this.#tree.forEach((value, specifier) => this.set(specifier, value));

        let installed = true;
        [...this.#tree.list.keys()].forEach(vspecifier => {
            const dependency = packages.find({vspecifier});
            installed = installed && !!dependency;
        });

        return done(installed, updated);
    }

    configure(config) {
        this.#config = typeof config === 'object' ? config : {};
        this.#hash = crc32(equal.generate(this.#config));
        this._invalidate();
    }
}
