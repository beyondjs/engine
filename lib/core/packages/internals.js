const ipc = require('beyond/utils/ipc');
const {ConfigCollection} = require('beyond/utils/config');

module.exports = class extends ConfigCollection {
    get dp() {
        return 'packages.internals';
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'packages'
        });
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }

    _createItem(config) {
        return new (require('./package'))(config, this);
    }
}
