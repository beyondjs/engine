const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Modules = require('./modules');
const Exports = require('./exports');

module.exports = class extends DynamicProcessor(Map) {
    #pkg;
    #modules;
    #exports;

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        const {Internal: InternalPackage} = require('beyond/package');
        const internal = pkg instanceof InternalPackage;

        this.#modules = internal ? new Modules(pkg.watcher) : void 0;
        this.#exports = new Exports();

        const children = new Map();
        this.#modules && children.set('modules', {child: this.#modules});
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

    _process() {

    }

    configure(modules, exports) {
        this.#modules?.configure(modules);
        this.#exports.configure(exports);
    }
}
