const ipc = require('beyond/utils/ipc');
const {FinderCollection} = require('beyond/utils/finder');
const Hash = require('./hash');

module.exports = class extends FinderCollection {
    #processor;
    get processor() {
        return this.#processor;
    }

    #extname;

    #hash;
    get hash() {
        return this.#hash;
    }

    constructor(processor, extname) {
        const {watcher} = processor;
        super(watcher);

        this.#processor = processor;
        this.#extname = extname;
        this.#hash = new Hash(this);
    }

    configure(path, config) {
        config = config && Object.assign(config, {extname: this.#extname});
        super.configure(path, config);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'processors-sources',
            filter: {processor: this.#processor.id}
        });
    }
}
