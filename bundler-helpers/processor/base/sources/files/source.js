const ipc = require('beyond/utils/ipc');
const {FinderCollection} = require('beyond/utils/finder');

module.exports = class extends FinderCollection.Item {
    #processor;

    get id() {
        const {specs, name} = this.#processor;
        return `${specs.bundle.id}//${name}//${this.relative.file}`;
    }

    get is() {
        return 'source';
    }

    constructor(collection, file) {
        super(collection, file);
        this.#processor = collection.processor;
    }

    _notify() {
        let table = 'processors-sources';

        ipc.notify('data-notification', {
            type: 'record/update',
            table: table,
            id: this.id
        });
    }
}