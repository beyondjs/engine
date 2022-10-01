const {ipc, FinderCollection} = global.utils;
const Source = require('./source');

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
        this.#hash = new (require('../hash'))(this);
    }

    configure(path, config) {
        config = config && Object.assign(config, {extname: this.#extname});
        super.configure(path, config);
    }

    _notify() {
        let table = 'processors-sources';
        let {application, bundle: {id}} = this.#processor.specs;
        id = id.split('//').pop();
        id.includes('template.') && (table = `${id.replace('.', '-')}-sources`);

        ipc.notify('data-notification', {
            type: 'list/update',
            table: table,
            filter: {application: application.id}
        });
    }
}
