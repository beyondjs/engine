const {ConfigCollection, ipc} = global.utils

module.exports = class extends ConfigCollection {
    get dp() {
        return 'applications';
    }

    #items = new (require('./items'))(this);
    get items() {
        return this.#items;
    }

    find({vname}) {
        return [...this.values()].find(pkg => pkg.vname === vname);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications'
        });
    }

    _createItem(config) {
        return new (require('./application'))(config, this);
    }
}
