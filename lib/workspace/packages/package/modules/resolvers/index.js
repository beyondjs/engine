const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const { relative } = require('path');
const ModulesEntries = require('./entries');
const Resolver = require('./resolver');

/**
 * Collection of package modules
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.modules.resolvers';
	}

	#package;
	get package() {
		return this.#package;
	}

	/**
	 * The collection of module.json entries. As they can specify more than one bundler, it means that
	 * one entry can have more than one module
	 */
	#entries;
	get entries() {
		return this.#entries;
	}

	get path() {
		return this.#entries.path;
	}

	/**
	 * Application modules constructor
	 *
	 * @param package {object} The package object
	 * @param config {object} The modules configuration
	 */
	constructor(pkg, config) {
		super();

		this.#package = pkg;

		const entries = (this.#entries = new ModulesEntries(pkg, config));
		super.setup(new Map([['entries', { child: entries }]]));
	}

	_prepared(require) {
		// Be sure that the modules are ready before the entries are processed
		const entries = this.#entries;
		entries.forEach(entry => require(entry, entry.id));
	}

	_process() {
		const entries = this.#entries;
		const updated = new Map();
		entries.forEach(entry =>
			entry.forEach(specs => {
				const resolver = this.has(specs.id)
					? this.get(specs.id)
					: new Resolver(this.#package, entry.file, specs);
				updated.set(specs.id, resolver);
			})
		);

		// Check if resolvers has changed
		const changed = (() => {
			if (this.size !== updated.size) return true;
			return [...updated.keys()].reduce((prev, resolver) => prev || !this.has(resolver.id), false);
		})();
		if (!changed) return false;

		// Destroy the unused resolvers
		[...this.values()].forEach(resolver => !updated.has(resolver.id) && resolver.destroy());

		// Set the processed entries
		super.clear(); // Do not use this.clear() as it would unsubscribe reused resolvers
		updated.forEach(resolver => this.set(resolver.id, resolver));
	}
};
