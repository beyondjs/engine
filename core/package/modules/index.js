const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {Internal: InternalPackage} = require('beyond/package');
const Modules = require('./modules');
const Exports = require('./exports');

module.exports = class extends DynamicProcessor(Map) {
    #modules;
    #exports;

    constructor(pkg) {
        super();
        const internal = pkg instanceof InternalPackage;

        this.#exports = new Exports();
        this.#modules = internal ? new Modules(pkg.watcher) : void 0;
    }

    configure(exports, modules) {
        this.#exports.configure(exports);
        this.#modules?.configure(modules);
    }
}
