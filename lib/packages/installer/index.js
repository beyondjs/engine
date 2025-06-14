const { PendingPromise } = require('@beyond-js/pending-promise/main');
const { createWriteStream } = require('fs');
const fs = require('fs').promises;
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
		const pkg = this.#pkg,
			version = this.#version;

		const dir = join(PATH, 'npm', `${pkg}@${version}`);
		const file = join(PATH, 'npm', `${pkg}@${version}.tgz`);
		return { file, dir };
	}

	/**
	 * Check if vpackage is already downloaded
	 */
	async #downloaded() {
		try {
			const { constants } = fs;
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
			const { constants } = fs;
			await fs.access(this.target.dir, constants.F_OK);
		} catch {
			return false;
		}
		return true;
	}

	#promises = {};

	async #fetch() {
		if (this.#promises.fetch) {
			await this.#promises.fetch;
			return;
		}

		const promise = (this.#promises.fetch = new PendingPromise());

		// Check if file is already downloaded
		const downloaded = await this.#downloaded();
		if (downloaded) {
			promise.resolve();
			return;
		}

		const pkg = this.#pkg,
			version = this.#version;
		const source = `https://registry.npmjs.org/${pkg}/-/${pkg}-${version}.tgz`;
		await fs.mkdir(PATH, { recursive: true });
		const { file: target } = this.target;

		const done = error =>
			file.close(() => {
				error
					? console.log(`Error downloading package "${pkg}@${version}": ${error.message}`)
					: console.log(`Package "${pkg}@${version}" was downloaded`);

				error ? unlink(target, () => promise.reject(error)) : promise.resolve();
			});

		const file = createWriteStream(target);

		console.log(`Downloading package "${pkg}@${version}" ...`);

		const request = https.request(source, response => {
			if (response.statusCode !== 200) {
				done('Response status was ' + response.statusCode);
				return;
			}

			response.on('data', chunk => file.write(chunk));
			response.on('end', () => done());
		});
		request.end();
		request.on('error', error => {
			file.end();
			done(error);
		});

		return await promise;
	}

	/**
	 * Download and unzip
	 *
	 * @return {Promise<void>}
	 */
	async install() {
		if (this.#promises.unzip) {
			await this.#promises.unzip;
			return;
		}

		const promise = (this.#promises.unzip = new PendingPromise());

		// Check if file is already downloaded and unzipped
		const unzipped = await this.#unzipped();
		if (unzipped) {
			promise.resolve();
			return;
		}

		const vname = `${this.#pkg}@${this.#version}`;

		// File must be previously downloaded
		try {
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
