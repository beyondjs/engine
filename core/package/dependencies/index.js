const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {Tree: DependenciesTree, Config: DependenciesConfig} = require('beyond/dependencies');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.dependencies';
    }

    #packages;
    #pkg;
    #tree;

    #config;
    get config() {
        return this.#config;
    }

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

    async fill() {
        await this.ready;
        await this.#tree.fill();
    }

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        // Do not require beyond/packages at the top of the file to avoid a circular dependency
        const packages = this.#packages = require('beyond/packages');
        super.setup(new Map([['package', {child: pkg}], ['packages', {child: packages}]]));
    }

    _prepared(require) {
        if (!this.#config) return false;
        if (this.#tree?.hash === this.#config.hash) return;

        this.#tree && this.children.unregister(['tree']);
        this.#tree?.destroy();

        const child = this.#tree = new DependenciesTree(this.#config);
        this.children.register(new Map([['tree', {child}]]));

        this.#packages.forEach(pkg => require(pkg));
    }

    _process() {
        const done = (installed) => {
            const changed = this.#tree.hash !== this.#config.hash || this.#installed !== installed;
            this.#installed = installed;
            return changed;
        }

        this.clear();
        if (!this.#tree.filled) return done(false);

        this.#tree.forEach((value, specifier) => this.set(specifier, value));

        let installed = true;
        [...this.#tree.list.keys()].forEach(vspecifier => {
            const dependency = this.#packages.find({vspecifier});
            installed = installed && !!dependency;
        });

        return done(installed);
    }

    configure(config) {
        this.#config = new DependenciesConfig(config);
        this._invalidate();
    }
}
