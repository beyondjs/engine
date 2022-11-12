const ipc = require('beyond/utils/ipc');
const {ConfigCollection} = require('beyond/utils/config');
const {Internal: InternalPackage} = require('beyond/package');

module.exports = class extends ConfigCollection {
    get dp() {
        return 'packages.internals';
    }

    #specs;

    /**
     * Internal packages constructor
     *
     * @param config {*}
     * @param specs {watchers: {boolean}}
     */
    constructor(config, specs) {
        super(config);
        this.#specs = specs;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'packages'
        });
    }

    _createItem(config) {
        return new InternalPackage(config, this.#specs);
    }
}
