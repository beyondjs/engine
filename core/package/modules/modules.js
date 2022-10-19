const {FinderCollection} = require('beyond/utils/finder');

module.exports = class extends FinderCollection {
    get dp() {
        return 'package.modules.beyond';
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    constructor(pkg) {
        super(pkg.watcher, require('./module'));
        this.#pkg = pkg;
    }

    configure(config) {
        if (!config) {
            super.configure();
            return;
        }

        const path = typeof config === 'string' ? config : config.path;
        super.configure(path, {filename: 'module.json', excludes: ['./builds', '.beyond', 'node_modules']});
    }
}
