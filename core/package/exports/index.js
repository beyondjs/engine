const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.exports';
    }

    #pkg;
    #modules;

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        const modules = this.#modules = pkg.modules;
        modules && super.setup(new Map([['modules', {child: modules}]]));
    }

    _prepared(require) {
        this.#modules?.forEach(module => {
            require(module.plugins) && module.plugins.forEach(({exports}) => require(exports));
        });
    }

    _process() {
        this.clear();
        this.#modules?.forEach(({plugins}) => {
            plugins.forEach(plugin => plugin.exports.forEach((plugin, subpath) => this.set(subpath, plugin)));
        });
    }
}
