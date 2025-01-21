const { ConfigCollection } = require('@beyond-js/config');
const ipc = require('@beyond-js/ipc/main');

module.exports = class extends ConfigCollection {
	get dp() {
		return 'packages';
	}

	#items = new (require('./items'))(this);
	get items() {
		return this.#items;
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

	_deleteItem(item) {
		super._deleteItem(item);
	}
};
