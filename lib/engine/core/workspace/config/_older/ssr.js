const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.start.config.ssr';
	}

	#package;
	#distribution;
	#ports;

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.errors.length;
	}

	#config;
	get config() {
		return this.#config;
	}

	constructor(pkg, distribution, ports) {
		super();
		this.#package = pkg;
		this.#distribution = distribution;
		this.#ports = ports;
	}

	_prepared(require) {
		const pkg = this.#package;
		const { libraries, deployment } = pkg;
		const { distributions } = deployment;
		if (!require(pkg) || !require(libraries) || !require(distributions)) return;

		libraries.forEach(library => require(library));
		distributions.forEach(distribution => require(distribution));
	}

	async _process(request) {
		const pkg = this.#package;
		const distribution = this.#distribution;

		const errors = [];
		for (const al of pkg.libraries.values()) {
			const { library } = al;
			if (!library) return;

			const imported = distribution.imports?.get(library.package);
			if (!imported) continue;

			const { distributions } = pkg.deployment;
			const found = [...distributions.values()].find(({ name }) => imported === name);
			if (!found || found.platform !== 'ssr') continue;

			const pkg = library.package;
			const name = `${pkg}/${imported}`;
			const port = distribution.local ? await this.#ports.get(name) : void 0;
			if (this._request !== request) return;

			const host = distribution.local ? `http://localhost:${port}` : found.host;
			hosts.set(pkg, host);
		}

		// Set the ssr host of the current project (if it is configured)
		const hosts = await (async () => {
			if (!distribution.ssr) return;

			const hosts = new Map();
			const { distributions } = pkg.deployment;
			const found = [...distributions.values()].find(({ name }) => distribution.ssr === name);
			if (!found || found.platform !== 'ssr') return;

			const pkg = pkg.package;
			const name = `${pkg}/${found.name}`;
			const port = distribution.local ? await this.#ports.get(name) : void 0;
			const host = distribution.local ? `http://localhost:${port}` : found.host;
			hosts.set(pkg, host);
			return hosts;
		})();
		if (this._request !== request) return;

		const config = hosts && [...hosts];
		if (equal(this.#config, config) && equal(this.#errors, errors)) return false;
		this.#config = config;
	}
};
