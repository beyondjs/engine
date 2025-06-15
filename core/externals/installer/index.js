const Downloader = require('./downloader');
const processTypes = require('./process-types');
const { join } = require('path');
const registry = require('../registry');
const externalsInstalled = require('../installed');

module.exports = class {
	#path;
	#pkg;
	#version;

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.#errors.length;
	}

	constructor(name) {
		if (!name) {
			this.#errors.push(`Package name must be specified`);
			return;
		}

		const { pkg, version, error } = (() => {
			const split = name.split('/');
			const scope = split[0].startsWith('@') ? split.shift() : void 0;
			if (!split.length) {
				return { error: `Package name "${name}" is invalid` };
			}

			const [pname, version] = split.shift().split('@');
			const pkg = (scope ? `${scope}/` : '') + pname;
			return { pkg, version };
		})();

		if (error) {
			this.#errors.push(error);
			return;
		}

		this.#pkg = pkg;
		this.#version = version;

		this.#path = join(process.cwd(), '.beyond/externals');
	}

	async #installPackage(name, version) {
		/**
		 * Download the package
		 */
		const downloader = new Downloader(name, version, this.#path);
		await downloader.process();

		const installed = await (async () => {
			await externalsInstalled.ready;
			return externalsInstalled.get(`${name}@${version}`);
		})();

		/**
		 * Process the types of the dependency
		 */
		await processTypes(installed);

		/**
		 * Install the dependencies required by the dependencies tree of the package being installed
		 */
		const { Tree: DependenciesTree, Config: DependenciesConfig } =
			// Do not move the import at the beginning of the file to avoid a circular dependency
			require('beyond/dependencies');
		const config = new DependenciesConfig(installed.json);
		const tree = new DependenciesTree(config);

		await tree.fill();
		for (const dependency of tree.list.values()) {
			/**
			 * Install the dependency
			 */
			const { specifier, version } = dependency;
			await this.#installPackage(specifier, version);
		}
	}

	async install() {
		if (!this.valid) return;

		const pkg = this.#pkg;
		const { version, error } = await (async () => {
			if (this.#version) return this.#version;

			const registered = registry.obtain(pkg);
			await registered.fill();
			if (!registered.valid) return { error: `Error fetching "${pkg}" package: ${registered.error}` };

			return { version: registered.latest };
		})();
		if (error) {
			this.#errors.push(error);
			return;
		}

		await this.#installPackage(pkg, version);
	}
};
