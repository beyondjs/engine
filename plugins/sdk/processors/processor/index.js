const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
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

    get conditional() {
        return this.#container.conditional;
    }

    get watcher() {
        return this.conditional.watcher;
    }

    get module() {
        return this.conditional.pexport.module;
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
        console.log('Processor configuration:', config);
    }
}
