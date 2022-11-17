const {Processor} = require('beyond/plugins/sdk');
const Sources = require('./sources');
const Compilers = require('./compilers');
const JS = require('./js');
const Types = require('./types');

module.exports = class extends Processor {
    get dp() {
        return 'processor-ts';
    }

    static get name() {
        return 'ts';
    }

    #path;
    get path() {
        return this.#path;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    get hash() {
        return 0;
    }

    #compilers;
    get compilers() {
        return this.#compilers;
    }

    #js;
    get js() {
        return this.#js;
    }

    #types;
    get types() {
        return this.#types;
    }

    constructor(bundle, processors) {
        super(bundle, processors, {});

        this.#sources = new Sources(this, {hashes: false});
        this.#compilers = new Compilers(this);
        this.#js = new JS(this);
        this.#types = new Types(this);
    }

    configure(config) {
        const {module} = this.plugin;
        this.#path = module.path;
        this.#sources.configure(module.path, config);
    }
}
