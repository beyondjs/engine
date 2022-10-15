const DynamicProcessor = require('beyond/utils/dynamic-processor');
const installs = require('beyond/externals/installs');
const DependenciesTree = require('beyond/dependencies-tree');

module.exports = class extends DynamicProcessor() {
    #pkg;
    #tree;

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

    }
}
