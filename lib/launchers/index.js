const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ProcessManager = require('./process-manager');

module.exports = class extends DynamicProcessor {
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
     * @param path {string} The path where the beyond.json is located
     * @param specs {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(path, specs) {
        super();
        this.#path = path;
        this.#specs = specs;

        new (require('./ipc'))(this);

        const config = new (require('./config'))(path);
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
