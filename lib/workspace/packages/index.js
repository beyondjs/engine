const { ConfigCollection } = require('@beyond-js/config');
const ipc = require('@beyond-js/ipc/main');
const Package = require('./package');

module.exports = class extends ConfigCollection {
	get dp() {
		return 'packages';
	}

	#workspace;
	get workspace() {
		return this.#workspace;
	}

	get processed() {
		if (!this.processed) return false;
		return this.reduce((processed, pkg) => processed && pkg.processed, true);
	}

	constructor(workspace, config) {
		super(config);
		this.#workspace = workspace;
	}

	/**
	 * Find a package by its name
	 * @param name {string} The package name
	 */
	find(name) {
		return [...this.values()].find(pkg => pkg.name === name);
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'list/update',
			table: 'packages'
		});
	}

	_createItem(config) {
		return new Package(this.#workspace, config);
	}

	_deleteItem(item) {
		super._deleteItem(item);
	}
};
