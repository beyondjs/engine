const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const crc32 = require('@beyond-js/crc32');
const equal = require('@beyond-js/equal');
const Package = require('./package');

/**
 * The packages dependencies are the dependencies configured in the package.json, plus the package libraries.
 * Only required in local environment to support dynamic imports, (as it is needed to know the version of the packages).
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.package_json.dependencies';
	}

	#package;

	#hash;
	get hash() {
		return this.#hash;
	}

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.#errors.length;
	}

	constructor(pkg) {
		super();
		this.#package = pkg;
		super.setup(
			new Map([
				['package_json', { child: pkg.packagejson }],
				['libraries', { child: pkg.libraries }]
			])
		);
	}

	#packages = new Map();
	#previous = [];

	_prepared(require) {
		const { valid, json } = this.children.get('package_json').child;
		if (!valid) {
			this.#errors = ['File package.json has reported errors'];
			this.#packages.forEach(pkg => pkg.destroy());
			this.#packages.clear();
			return;
		}

		const { libraries } = this.#package;
		libraries.forEach(library => require(library));

		const setPackages = (updated, dependencies, type = undefined) => {
			dependencies = dependencies ? Object.keys(dependencies) : [];
			dependencies.forEach(dependency => {
				const pkg = this.#packages.has(dependency)
					? this.#packages.get(dependency)
					: new Package(this.#package, dependency, type);

				updated.set(dependency, pkg);
			});
		};

		const updated = new Map();
		setPackages(updated, json.dependencies);
		setPackages(updated, json.devDependencies, 'devDependencies');

		// Clean up not required packages
		this.#packages.forEach((pkg, dependency) => !updated.has(dependency) && pkg.destroy());

		this.#packages.clear();

		updated.forEach((pkg, name) => {
			require(pkg);
			this.#packages.set(name, pkg);
		});
	}

	_process() {
		const done = ({ value, errors }) => {
			if (errors?.length && equal(errors, this.#errors)) return false;
			this.#errors = errors ? errors : [];
			if (!this.valid) {
				this.clear();
				return;
			}

			const compute = {};
			value.forEach((version, pkg) => (compute[pkg] = version));
			const hash = crc32(equal.generate(compute));
			if (this.#hash === hash) return false;

			this.#hash = hash;
			this.clear();
			value.forEach((version, pkg) => this.set(pkg, version));
			this.#previous = [...this];
			if (equal(value, this.#previous)) return false;
		};

		const value = new Map();
		const errors = [];
		this.#package.libraries.forEach(library => value.set(library.pkg, library.version));

		const { valid, json } = this.children.get('package_json').child;
		if (!valid) return done({ value });

		const dependencies = json.dependencies ? Object.keys(json.dependencies) : [];
		const devDependencies = json.devDependencies ? Object.keys(json.devDependencies) : [];

		const packages = dependencies.concat(devDependencies);
		packages.forEach(dependency => {
			const pkg = this.#packages.get(dependency);
			!pkg.valid && errors.push(pkg.error);
		});
		if (errors.length) return done({ errors });

		packages.forEach(dependency => value.set(dependency, this.#packages.get(dependency).version));
		return done({ value });
	}
};
