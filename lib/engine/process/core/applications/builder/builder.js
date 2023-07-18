/**
 * Application builder
 */
module.exports = class {
	#application;
	get application() {
		return this.#application;
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
		this.#application.builder.emit(...params);
	}

	constructor(application) {
		this.#application = application;
		this.#builds = new (require('./builds'))(this);
	}

	async build(key, specs) {
		const distribution = await require('./distribution')(this.#application, key);
		if (typeof distribution !== 'object') throw new Error('Invalid distribution specifications');

		const { platform } = distribution;
		const { platforms } = global;
		if (!distribution.npm && !platforms.all.includes(platform)) {
			this.emit('error', `Platform is not specified or is invalid: "${platform}"`);
			this.emit('processed', 'Processing not completed');
			return;
		}

		if (!['development', 'production'].includes(distribution.environment))
			throw new Error(`Environment "${distribution.environment}" is invalid`);

		const application = this.#application;
		await application.ready;
		const appName = application.name ? `"${application.name}": ` : '';
		this.emit('message', `Building application ${appName}"${application.path}"`);

		this.#processing = true;
		const processor = new (require('./processor.js'))(this, distribution, specs);

		try {
			await processor.process();
			this.#processing = false;
			this.emit('processed', 'Processing completed');
		} catch (exc) {
			console.trace(exc.stack);
			this.#processing = false;
			const error = `Exception caught building application: ${exc.message}`;
			this.emit('error', error);
			this.emit('processed', 'Processing not completed');
		}
	}

	destroy() {
		this.removeAllListeners();
	}
};
