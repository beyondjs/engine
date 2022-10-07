const {FinderCollection} = require('beyond/utils/finder');

module.exports = class extends FinderCollection {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #config;
    get config() {
        return this.#config;
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }

    constructor(pkg, config) {
        super(pkg.watcher, require('./module'), {items: {subscriptions: ['change']}});
        this.#pkg = pkg;
        this.#config = config;

        config.on('initialised', this.#configure);
        config.on('change', this.#configure);
        config.initialised && this.#configure();
    }

    #initialising = false;
    get initialising() {
        return this.#initialising || super.initialising;
    }

    async initialise() {
        if (this.initialised || this.#initialising) return;
        this.#initialising = true;

        // Create the files watcher of the package
        const config = this.#config;
        !config.initialised && await config.initialise();

        await super.initialise();
        this.#initialising = false;
    }

    #configure = () => {
        const config = this.#config;
        if (!config.valid || !config.value) {
            super.configure();
            return;
        }
        super.configure(config.path, {filename: 'module.json', excludes: ['./builds', 'node_modules']});
    }

    destroy() {
        super.destroy();
        this.#config.off('initialised', this.#configure);
        this.#config.off('change', this.#configure);
    }
}
