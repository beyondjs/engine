const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ProcessManager = require('./process-manager');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bees';
    }

    #path;
    get path() {
        return this.#path;
    }

    get errors() {
        return [];
    }

    get warnings() {
        return [];
    }

    /**
     * BEEs instances constructor
     *
     * @param path {string} The path where the beyond.json is located
     */
    constructor(path) {
        super();
        this.#path = path;

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
            const {id} = specs;
            !this.has(id) && this.set(id, new ProcessManager());
            this.get(id).update(specs);
        });

        // Destroy processes that has been removed from configuration
        this.forEach((processManager, path) => !config.has(path) && processManager.destroy());
    }
}
