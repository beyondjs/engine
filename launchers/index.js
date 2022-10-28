const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ProcessManager = require('./process-manager');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'launchers';
    }

    #path;
    get path() {
        return this.#path;
    }

    #specs;

    get errors() {
        return [];
    }

    get warnings() {
        return [];
    }

    /**
     * Launcher instances constructor
     *
     * @param specs {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(specs) {
        super();
        this.#specs = specs;

        new (require('./ipc'))(this);

        const config = new (require('./config'))(process.cwd());
        super.setup(new Map([['config', {child: config}]]));
    }

    _prepared(require) {
        const config = this.children.get('config').child;
        config.forEach(item => require(item));
    }

    _process() {
        const config = this.children.get('config').child;
        config.forEach(specs => {
            const {id, key, value} = specs;
            const pm = this.has(id) ? this.get(id) : new ProcessManager();
            this.set(id, pm);

            const local = this.#specs;
            pm.update(key, Object.assign({local}, value));
        });

        // Destroy processes that has been removed from configuration
        this.forEach((processManager, path) => !config.has(path) && processManager.destroy());
    }
}