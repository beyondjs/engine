const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Modules = require('./modules');
const Exports = require('./exports');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.modules';
    }

    #pkg;
    #modules;
    #exports;

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        const internal = pkg.is === 'internal';

        this.#modules = internal ? new Modules(pkg) : void 0;
        this.#exports = new Exports(pkg);

        const children = new Map();
        internal && children.set('modules', {child: this.#modules});
        children.set('exports', {child: this.#exports});
        super.setup(children);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'packages-modules',
            filter: {pkg: this.#pkg.id}
        });
    }

    _prepared(require) {
        this.#exports.forEach(module => require(module));
        this.#modules.forEach(module => require(module));
    }

    _process() {
        const updated = new Map();
        let changed = false;

        const set = module => {
            const {id} = module;
            !this.has(id) && (changed = true) && updated.set(id, module);
        }

        this.#exports.forEach(module => set(module));
        this.#modules.forEach(module => set(module));

        this.clear();
        changed = changed || [...this.keys()].reduce((vspecifier, prev) => prev || !updated.has(vspecifier), false);
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    /**
     * Configure the modules specification
     *
     * @param config {*} The package.json specification
     */
    configure(config) {
        this.#modules?.configure(config.modules);
        this.#exports.configure(config);
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }
}
