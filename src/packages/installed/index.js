const DynamicProcessor = require('@beyond-js/dynamic-processor');
const fs = require('fs').promises;
const { join } = require('path');
const PackageReader = require('./package-reader');

module.exports = new (class extends DynamicProcessor(Map) {
	get dp() {
		return 'externals';
	}

	#path;

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	constructor() {
		super();
		this.#path = join(process.cwd(), '.beyond/dependencies');
	}

	async _begin() {
		const warnings = (this.#warnings = []);
		await fs.mkdir(this.#path, { recursive: true });

		const process = async vname => {
			const path = join(this.#path, vname);
			const pkgjson = join(path, 'package.json');

			// Check if the package.json file exists
			try {
				const { constants } = fs;
				await fs.access(pkgjson, constants.F_OK);
			} catch {
				return;
			}

			const reader = new PackageReader(path, vname);
			await reader.process();
			reader.error ? `Package "${vname}" couldn't be processed: ${reader.error}` : this.set(vname, reader);
		};

		const promises = [];
		const entries = await fs.readdir(this.#path, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			if (!entry.name.startsWith('@')) {
				await process(entry.name);
				continue;
			}

			const scope = entry.name;
			const entries = await fs.readdir(join(this.#path, scope), { withFileTypes: true });
			for (const entry of entries) {
				entry.isDirectory() && (await process(`${scope}/${entry.name}`));
			}
		}

		await Promise.all(promises);
	}
})();
