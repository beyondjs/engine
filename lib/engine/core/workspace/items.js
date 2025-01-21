module.exports = class {
	#packages;

	constructor(packages) {
		this.#packages = packages;
	}

	get processed() {
		if (!this.#packages.processed) return false;
		let processed = true;
		this.#packages.forEach(pkg => (processed = processed && pkg.processed));
		return processed;
	}

	/**
	 * Find a package by its name
	 * @param name {string} The package name
	 */
	find(name) {
		return [...this.values()].find(pkg => pkg.name === name);
	}
};
