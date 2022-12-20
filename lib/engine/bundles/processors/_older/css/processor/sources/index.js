const instances = new Map();

module.exports = class extends global.ProcessorSources {
    #functions;
    get functions() {
        return this.#functions;
    }

    constructor(processor) {
        super(processor);
        const {bundle} = processor.specs;

        // Do not create the functions object if it is the functions processor
        if (bundle.type.startsWith('template/processors')) return;

        if (instances.has(processor.name)) {
            this.#functions = instances.get(processor.name);
            return;
        }

        this.#functions = new (require('./functions'))(processor);
        instances.set(processor.name, this.#functions);
    }
}
