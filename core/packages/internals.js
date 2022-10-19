const ipc = require('beyond/utils/ipc');
const {ConfigCollection} = require('beyond/utils/config');
const {Internal: InternalPackage} = require('beyond/package');

module.exports = class extends ConfigCollection {
    get dp() {
        return 'packages.internals';
    }

    #packages;

    constructor(packages, config) {
        super(config);
        this.#packages = packages;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'packages'
        });
    }

    _createItem(config) {
        return new InternalPackage(config, this.#packages);
    }
}
