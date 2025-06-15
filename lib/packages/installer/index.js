const { PendingPromise } = require('@beyond-js/pending-promise/main');
const { createWriteStream } = require('fs');
const fs = require('fs').promises;
const { constants } = require('fs');
const https = require('https');
const { join } = require('path');

const PATH = join(process.cwd(), '/.beyond/packages');

module.exports = class {
	#pkg;
	#version;

	constructor(pkg, version) {
		if (!pkg || !version) throw new Error('Invalid parameters');

		this.#pkg = pkg;
		this.#version = version;
	}

	get target() {
		const pkg = this.#pkg;
		const version = this.#version;

		const dir = join(PATH, 'npm', `${pkg}@${version}`);
		const file = join(PATH, 'npm', `${pkg}@${version}.tgz`);
		return { file, dir };
	}

	/**
	 * Check if vpackage is already downloaded
	 */
	async #downloaded() {
		try {
			await fs.access(`${this.target.file}`, constants.F_OK);
		} catch {
			return false;
		}
		return true;
	}

	/**
	 * Check if vpackage is already downloaded and unzipped
	 */
	async #unzipped() {
		try {
			await fs.access(this.target.dir, constants.F_OK);
		} catch {
			return false;
		}
		return true;
	}

	#promises = {};

	async #fetch() {
		// If a fetch is already in progress, wait for it to complete
		if (this.#promises.fetch) {
			await this.#promises.fetch;
			return;
		}

		// Create a new promise for the fetch operation
		const promise = (this.#promises.fetch = new PendingPromise());

		// Check if package is already downloaded, if so, resolve the promise
		const downloaded = await this.#downloaded();
		if (downloaded) {
			promise.resolve();
			return;
		}

		console.log(`Downloading package "${pkg}@${version}" from ${source} ...`);

		const pkg = this.#pkg;
		const version = this.#version;
		const source = `https://registry.npmjs.org/${pkg}/-/${pkg}-${version}.tgz`;

		// Ensure the target directory exists
		await fs.mkdir(PATH, { recursive: true });
		const { file: target } = this.target;

		const done = error => {
			file.end(() => {
				error
					? console.log(`Error downloading package "${pkg}@${version}": ${error.message}`.red)
					: console.log(`Package "${pkg}@${version}" was downloaded`);

				// If an error occurred while downloading, delete the target file
				error ? unlink(target, () => promise.reject(error)) : promise.resolve();
			});
		};

		const file = createWriteStream(target);
		file.on('error', error => promise.reject(error));

		const request = https.request(source, response => {
			if (response.statusCode !== 200) {
				done('Response status was ' + response.statusCode);
				return;
			}

			response.on('data', chunk => file.write(chunk));
			response.on('end', () => done());
			response.on('error', error => done(error));
		});
		request.end();
		request.on('error', error => done(error));

		return await promise;
	}

	/**
	 * Download and unzip
	 *
	 * @return {Promise<void>}
	 */
	async install() {
		// If an unzip operation is already in progress, wait for it to complete
		if (this.#promises.unzip) {
			await this.#promises.unzip;
			return;
		}

		const promise = (this.#promises.unzip = new PendingPromise());

		// If package is already downloaded and unzipped, resolve the promise
		const unzipped = await this.#unzipped();
		if (unzipped) {
			promise.resolve();
			return;
		}

		const vname = `${this.#pkg}@${this.#version}`;

		try {
			// Fetch the package, if previously downloaded, this will resolve immediately
			await this.#fetch();
			const { file: source, dir: target } = this.target;

			console.log(`Extracting package "${vname}" ...`);
			await require('./extract')(source, target);
			console.log(`Package "${vname}" was extracted`);

			promise.resolve();
		} catch (exc) {
			console.log(`Error extracting package "${vname}": ${exc.message}`);
			promise.reject(exc);
		}

		return await promise;
	}
};
