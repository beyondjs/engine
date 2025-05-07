module.exports = class {
	#pkg;
	#factory;

	constructor(pkg) {
		this.#pkg = pkg;
		this.#factory = new (require('./factory'))(pkg);
	}

	/**
	 * Creates a seeker instance
	 *
	 * @param specifier {string} The bundle specifier
	 * @param distribution {object} The distribution specification
	 * @return {object}
	 */
	create(specifier, distribution) {
		return new (require('./wrapper'))(this.#factory, this.#pkg, specifier, distribution);
	}
};
