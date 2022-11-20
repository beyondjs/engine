const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'processor';
    }

    #container;
    /**
     * The processors set container of the current processor
     * @return {*}
     */
    get container() {
        return this.#container;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    get targetedExport() {
        return this.#container.targetedExport;
    }

    get plugin() {
        return this.targetedExport.plugin;
    }

    get watcher() {
        return this.targetedExport.watcher;
    }

    get module() {
        return this.targetedExport.packageExport.module;
    }

    get hash() {
        throw new Error('Property .hash must be overridden');
    }

    constructor(container, specs) {
        super();
        this.#container = container;
        this.#specs = specs;
    }

    configure(config) {
        void config;
        throw new Error('Method ".configure" must be overridden');
    }
}
