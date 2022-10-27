const ipc = require('beyond/utils/ipc');
const {FinderCollection} = require('beyond/utils/finder');
const Source = require('./source');
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
        const {watcher} = processor.specs;
        super(watcher, Source, {items: {subscriptions: ['change']}});

        this.#processor = processor;
        this.#extname = extname;
        this.#hash = new Hash(this);
    }

    configure(path, config) {
        config = config && Object.assign(config, {extname: this.#extname});
        super.configure(path, config);
    }

    _notify() {
        let table = 'processors-sources';

        ipc.notify('data-notification', {
            type: 'list/update',
            table: table,
            filter: {processor: this.#processor.id}
        });
    }
}
