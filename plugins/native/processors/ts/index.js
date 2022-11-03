const {Processor} = require('beyond/plugins/sdk');
const Sources = require('./sources');
const Compilers = require('./compilers');
const JS = require('./js');

module.exports = class extends Processor {
    get dp() {
        return 'processor-ts';
    }

    static get name() {
        return 'ts';
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

    constructor(bundle, processors) {
        super(bundle, processors, {});

        this.#sources = new Sources(this, {hashes: false});
        this.#compilers = new Compilers(this);
        this.#js = new JS(this);
    }
}
