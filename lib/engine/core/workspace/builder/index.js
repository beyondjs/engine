const { EventEmitter } = require('events');

module.exports = class extends EventEmitter {
	#package;

	async build(distribution, specs) {
		const builder = new (require('./builder'))(this.#package);
		return await builder.build(distribution, specs);
	}

	constructor(pkg) {
		super();
		this.#package = pkg;
	}
};
