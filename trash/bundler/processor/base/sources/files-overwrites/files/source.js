const ipc = require('@beyond-js/ipc/main');
const { FinderCollection } = require('@beyond-js/finder');
module.exports = class extends FinderCollection.Item {
	#processor;

	get id() {
		const { specs, name } = this.#processor;
		return `${specs.bundle.id}//${name}//${this.relative.file}`;
	}

	get is() {
		return 'source';
	}

	constructor(collection, file) {
		super(collection, file);
		this.#processor = collection.processor;
	}

	_notify() {
		let table = 'processors-sources';
		let {
			bundle: { id }
		} = this.#processor.specs;
		id = id.split('//').pop();
		id.includes('template.') && (table = `${id.replace('.', '-')}-sources`);

		ipc.notify('data-notification', {
			type: 'record/update',
			table: table,
			id: this.id
		});
	}
};
