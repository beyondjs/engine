const DynamicProcessor = require('beyond/utils/dynamic-processor');
const StandardExports = require('./standard');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'package.exports';
    }

    #pkg;
    #modules;

    /**
     * The standard package.json exports
     */
    #standard;

    constructor(pkg) {
        super();
        this.#pkg = pkg;

        const modules = this.#modules = pkg.modules;
        const standard = this.#standard = new StandardExports(pkg);

        const children = [['standard', {child: standard}]];
        modules && children.push(['modules', {child: modules}]);
        super.setup(new Map(children));
    }

    _prepared(require) {
        this.#modules?.forEach(module => {
            require(module.plugins) && module.plugins.forEach(({exports}) => require(exports));
        });
    }

    _process() {
        this.clear();
        this.#standard.forEach((pexport, subpath) => this.set(subpath, pexport));
        this.#modules?.forEach(({plugins}) => {
            plugins.forEach(plugin => plugin.exports.forEach((plugin, subpath) => this.set(subpath, plugin)));
        });
    }

    configure(config) {
        this.#standard.configure(config);
    }
}
