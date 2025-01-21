module.exports = class {
	#package;
	#dependencies = new Map();

	#packages;
	get packages() {
		return this.#packages;
	}

	constructor(pkg) {
		this.#package = pkg;
		this.#packages = new (require('./packages'))(pkg);
	}

	get(distribution) {
		const { key } = distribution;
		if (this.#dependencies.has(key)) return this.#dependencies.get(key);

		const dependencies = new (require('./bundles'))(this.#package, distribution);
		this.#dependencies.set(key, dependencies);
		return dependencies;
	}
};
