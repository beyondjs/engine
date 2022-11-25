const {Processor} = require('beyond/plugins/sdk');
const Sources = require('./sources');
const Analyzer = require('./analyzer');
const Dependencies = require('./dependencies');
const Exports = require('./exports');
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

    #analyzer;
    get analyzer() {
        return this.#analyzer;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #exports;
    get exports() {
        return this.#exports;
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
        this.#analyzer = new Analyzer(this.#sources);
        this.#dependencies = new Dependencies(this.#analyzer);
        this.#exports = new Exports(this.#analyzer);
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
