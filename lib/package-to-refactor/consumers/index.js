module.exports = class {
	#package;
	#consumers = new Map();

	constructor(pkg) {
		this.#package = pkg;
	}

	get(distribution, language) {
		const key = `${distribution.key}/${language}`;
		if (this.#consumers.has(key)) return this.#consumers.get(key);

		const consumers = new (require('./consumers'))(this.#package, distribution, language);
		this.#consumers.set(key, consumers);
		return consumers;
	}
};
