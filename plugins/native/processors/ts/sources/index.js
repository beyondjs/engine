const {Sources, SourcesFile} = require('beyond/plugins/sdk');
const Hashes = require('./hashes');

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

        this.#tsconfig = new SourcesFile(processor, {file: 'tsconfig.json'});
        this.#hashes = new Hashes(this);
    }
}
