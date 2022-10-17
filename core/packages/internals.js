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

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }

    _createItem(config) {
        return new InternalPackage(config, this.#packages);
    }
}
