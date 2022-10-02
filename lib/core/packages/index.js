const ipc = require('beyond/utils/ipc');
const ConfigCollection = require('beyond/utils/config/collection');

module.exports = class extends ConfigCollection {
    get dp() {
        return 'applications';
    }

    #items = new (require('./items'))(this);
    get items() {
        return this.#items;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications'
        });
    }

    _createItem(config) {
        return new (require('./package'))(config, this);
    }
}
