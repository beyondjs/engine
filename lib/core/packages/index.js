const ipc = require('beyond/utils/ipc');
const {ConfigCollection} = require('beyond/utils/config');

module.exports = class extends ConfigCollection {
    get dp() {
        return 'packages';
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'packages'
        });
    }

    _createItem(config) {
        return new (require('./package'))(config, this);
    }
}
