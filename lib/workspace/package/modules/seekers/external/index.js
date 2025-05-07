const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const packages = require('@beyond-js/uimport/packages');
const { platforms } = global;

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'dependencies.external';
	}

	#pkg;
	get pkg() {
		return this.#pkg;
	}

	#dependency;
	get dependency() {
		return this.#dependency;
	}

	#dependencies;
	get dependencies() {
		return this.#dependencies;
	}

	#subpath;
	get subpath() {
		return this.#subpath;
	}

	#version;
	get version() {
		return this.#version ? this.#version : this.#dependency.json.version;
	}

	/**
	 * How the external is imported/required, in node environment the version is not specified
	 * as nodejs resolves the resources from the node_modules folder, otherwise the version must be specified
	 * @param distribution {any} The distribution specification
	 * @return {string|*}
	 */
	resource(distribution) {
		if (!this.processed) throw new Error('Object not processed');
		if (this.#dependency.error) return '';

		const { platform } = distribution;
		const subpath = this.#subpath ? `/${this.#subpath}` : '';
		return distribution.npm || platforms.node.includes(platform) || platform === 'deno'
			? this.#dependency.name + subpath
			: this.#dependency.name + `@${this.version}` + subpath;
	}

	/**
	 * The url of the resource. This is actually required to process the import maps in esm mode
	 *
	 * @param distribution {any} The distribution specification
	 * @return {string}
	 */
	pathname(distribution) {
		if (!this.processed) throw new Error('Object not processed');
		if (this.#dependency.error) return '';

		const baseDir = distribution.baseDir ? distribution.baseDir : '/';
		const resource = this.resource(distribution);

		return `${baseDir}packages/${resource}`;
	}

	#error;
	get error() {
		return this.#error || this.#dependency.error;
	}

	get name() {
		return this.#dependency.name;
	}

	get path() {
		return this.#dependency.path;
	}

	get subpaths() {
		return this.#dependency.subpaths;
	}

	get json() {
		return this.#dependency.json;
	}

	#processed = false;

	_prepared() {
		return this.#processed;
	}

	/**
	 * External package finder constructor
	 *
	 * @param dependency {string} The name of the dependency package
	 * @param version {string} The package version
	 * @param subpath {string} The subpath defined in the exports configuration property
	 * @param pkg {object} The package object
	 */
	constructor(dependency, version, subpath, pkg) {
		super();
		this.#pkg = pkg;

		this.#dependency = packages.get(dependency, { cwd: pkg.path });
		this.#dependencies = new (require('./dependencies'))(this);
		this.#version = version;
		this.#subpath = subpath;

		const done = () => (this.#processed = true) && this._invalidate();
		this.#dependency
			.process()
			.then(done)
			.catch(exc => {
				this.#error = `Error processing package: ${exc.message}`;
				console.error(exc.stack);
				done();
			});
	}
};
