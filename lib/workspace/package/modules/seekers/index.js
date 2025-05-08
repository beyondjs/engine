module.exports = class {
	#package;
	#factory;

	constructor(pkg) {
		this.#package = pkg;
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
		return new (require('./wrapper'))(this.#factory, this.#package, specifier, distribution);
	}
};
