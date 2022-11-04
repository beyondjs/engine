const {Sources} = require('beyond/plugins/sdk');
const Hashes = require('./hashes');
const TSConfig = require('./tsconfig');

module.exports = class extends Sources {
    #tsconfig;
    get tsconfig() {
        return this.#tsconfig;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    constructor(processor) {
        super(processor, {extname: ['.ts', '.tsx'], hashes: false});

        this.#tsconfig = new TSConfig(processor);
        this.#hashes = new Hashes(this);
    }

    configure(path, config) {
        this.#tsconfig.configure(path);
        super.configure(path, config);
    }
}
