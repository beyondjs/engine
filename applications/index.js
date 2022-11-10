const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Factory = require('./factory');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'launchers';
    }

    #path;
    get path() {
        return this.#path;
    }

    #inspect;

    get errors() {
        return [];
    }

    get warnings() {
        return [];
    }

    /**
     * Launcher instances constructor
     *
     * @param specs {{inspect: number}} Actually only the engine inspection port
     */
    constructor(specs) {
        super();
        this.#inspect = specs.inspect;

        new (require('./ipc'))(this);

        const config = new (require('./config'))(process.cwd());
        super.setup(new Map([['config', {child: config}]]));

        /**
         * Auto-initialise
         */
        console.log('Applications auto-initialisation should be removed');
        this.ready;
    }

    _process() {
        let changed = false;
        const updated = new Map();

        const config = this.children.get('config').child;
        config.forEach((specs, key) => {
            const factory = (() => {
                if (this.has(key)) return this.get(key);
                changed = true;
                return new Factory(specs, this.#inspect);
            })();

            updated.set(key, factory);
        });

        // Destroy processes that has been removed from configuration
        this.forEach((manager, path) => !config.has(path) && manager.destroy());
        this.clear();
        updated.forEach((value, key) => !this.has(key) && (changed = true) && this.set(key, value));
    }
}
