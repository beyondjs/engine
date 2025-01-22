const { environments } = require('beyond/environments');

/**
 * Package builder
 */
module.exports = class {
	#package;
	get package() {
		return this.#package;
	}

	#builds;
	get builds() {
		return this.#builds;
	}

	#processing = false;
	get processing() {
		return this.#processing;
	}

	emit(...params) {
		this.#package.builder.emit(...params);
	}

	constructor(pkg) {
		this.#package = pkg;
		this.#builds = new (require('./builds'))(this);
	}

	async build(key, specs) {
		const distribution = await require('./distribution')(this.#package, key, specs);
		if (typeof distribution !== 'object') throw new Error('Invalid distribution specifications');

		const { platform } = distribution;
		const { platforms } = global;
		if (!distribution.npm && !platforms.all.includes(platform)) {
			this.emit('error', `Platform is not specified or is invalid: "${platform}"`);
			this.emit('processed', 'Processing not completed');
			return;
		}

		if (!environments.includes(distribution.environment))
			throw new Error(`Environment "${distribution.environment}" is invalid`);

		const pkg = this.#package;
		await pkg.ready;
		const appName = pkg.name ? `"${pkg.name}": ` : '';
		this.emit('message', `Building package ${appName}"${pkg.path}"`);

		this.#processing = true;
		const processor = new (require('./processor.js'))(this, distribution, specs);

		try {
			await processor.process();
			this.#processing = false;
			this.emit('processed', 'Processing completed');
		} catch (exc) {
			console.trace(exc.stack);
			this.#processing = false;
			const error = `Exception caught building package: ${exc.message}`;
			this.emit('error', error);
			this.emit('processed', 'Processing not completed');
		}
	}

	destroy() {
		this.removeAllListeners();
	}
};
