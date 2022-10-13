const {FinderCollection} = require('beyond/utils/finder');

module.exports = class extends FinderCollection {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }

    constructor(pkg) {
        super(pkg.watcher, require('./module'), {items: {subscriptions: ['change']}});
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
