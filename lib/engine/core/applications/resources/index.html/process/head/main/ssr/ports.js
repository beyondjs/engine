const ipc = require('@beyond-js/ipc/main');
const { PendingPromise } = require('@beyond-js/pending-promise/main');

module.exports = new (class {
	#ports = new Map();

	async get(id) {
		if (this.#ports.has(id)) return await this.#ports.get(id).value;
		const promise = new PendingPromise();
		this.#ports.set(id, promise);

		const data = await ipc.exec('main', 'launchers/data', id);
		const port = data?.ports?.http;
		promise.resolve(port);
		return port;
	}
})();
