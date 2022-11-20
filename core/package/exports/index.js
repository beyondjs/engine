const DynamicProcessor = require('beyond/utils/dynamic-processor');
const StandardExports = require('./standard-exports');

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
        this.#standard.forEach((packageExport, subpath) => this.set(subpath, packageExport));
        this.#modules?.forEach(({plugins}) => {
            plugins.forEach(plugin =>
                plugin.packageExports.forEach((packageExport, subpath) => this.set(subpath, packageExport)));
        });
    }

    configure(config) {
        this.#standard.configure(config);
    }
}
