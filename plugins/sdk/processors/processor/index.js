const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    #container;
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

    constructor(container, specs) {
        super();

        this.#container = container;
        this.#specs = specs;
    }

    configure(config) {
        console.log('Processor configuration:', config);
    }
}
