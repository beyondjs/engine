const {FinderCollection} = require('beyond/utils/finder');
const {join} = require('path');

module.exports = class extends FinderCollection {
    get dp() {
        return 'modules';
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
        const done = path => {
            !path ? super.configure() : super.configure(path,
                {filename: 'module.json', excludes: ['./builds', '.beyond', 'node_modules']});
        }

        if (!config) return done();

        const path = typeof config === 'string' ? config : config.path;
        done(join(this.#pkg.path, path));
    }
}
