const { fork } = require('child_process');
const ipc = require('@beyond-js/ipc/main');
const { join } = require('path');

module.exports = class {
	#process;
	get process() {
		return this.#process;
	}

	/**
	 *  BeyondJS local engine constructor
	 *
	 * @param dirname {string} The root folder of the instance
	 * @param specs {{inspect: number}} The engine specification, actually the inspection port
	 */
	constructor(dirname, specs) {
		const cwd = process.cwd();
		const path = join(__dirname, 'fork.js');
		const args = [JSON.stringify({ dirname, inspect: specs.inspect })];

		// Fork the engine
		this.#process = fork(path, args, { cwd });

		// Register into the IPC for interprocess communication
		ipc.register('engine', this.#process);
	}
};
