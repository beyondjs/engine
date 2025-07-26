const ipc = require('@beyond-js/ipc/main');

module.exports = new (class IpcManager {
	#ready;
	#server;

	// The working directory
	#wd;
	get wd() {
		return this.#wd;
	}

	exec(action, specs = {}) {
		return ipc.exec('engine', action, specs);
	}

	async getWd() {
		this.#wd = await ipc.exec('engine', 'server/wd');
		return this.#wd;
	}

	async getServer(wd) {
		wd = wd ? wd : await this.getWd();
		const { Server } = require('./builder/models');
		this.#server = new Server(wd);
		return this.#server;
	}

	main(action, specs) {
		return ipc.exec('main', action, specs);
	}

	async initialise() {
		await this.getServer();
		this.#ready = true;
	}
})();
