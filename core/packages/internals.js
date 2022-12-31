const ipc = require('beyond/utils/ipc');
const {ConfigCollection} = require('beyond/utils/config');

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
        // Do not move to the beginning of the file to avoid cyclical reference
        // To reproduce the cyclical reference: request 'beyond/package'
        const {Internal: InternalPackage} = require('beyond/package');
        return new InternalPackage(config, this.#specs);
    }

    destroy() {
        super.destroy();
        this.forEach(pkg => pkg.destroy());
    }
}
