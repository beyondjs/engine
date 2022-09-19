module.exports = class {
    #code;
    get code() {
        return this.#code;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    constructor(processor) {
        const {name, specs} = processor;
        const {application} = specs;
        const template = application.template.processors[name].get(specs.distribution);

        this.#code = new (require('./code'))(template);
        this.#hash = new (require('./hash'))(template);
    }
}
