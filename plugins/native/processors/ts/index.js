const {Processor} = require('beyond/plugins/sdk');
const Sources = require('./sources');

module.exports = class extends Processor {
    static get name() {
        return 'ts';
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    #compilers = new Map();
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
        this.#js = new JS();
    }
}
