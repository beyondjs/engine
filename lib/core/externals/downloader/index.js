const PendingPromise = require('beyond/utils/pending-promise');
const {createWriteStream} = require('fs');
const fs = require('beyond/utils/fs');
const https = require('https');
const {join} = require('path');

module.exports = class {
    #pkg;
    #version;
    #path;

    constructor(pkg, version, path) {
        if (!pkg || !version || !path) throw new Error('Invalid parameters');

        this.#pkg = pkg;
        this.#version = version;
        this.#path = path;
    }

    get target() {
        const pkg = this.#pkg, version = this.#version;

        const dir = join(this.#path, `${pkg}@${version}`);
        const file = join(this.#path, `${pkg}@${version}.tgz`);
        return {file, dir};
    }

    /**
     * Check if vpackage is already downloaded
     */
    async #downloaded() {
        return await fs.exists(this.target.file);
    }

    /**
     * Check if vpackage is already downloaded and unzipped
     */
    async #unzipped() {
        return await fs.exists(this.target.dir);
    }

    #promises = {};

    async #fetch() {
        if (this.#promises.fetch) {
            await this.#promises.fetch;
            return;
        }

        const promise = this.#promises.fetch = new PendingPromise();

        // Check if file is already downloaded
        const downloaded = await this.#downloaded();
        if (downloaded) {
            promise.resolve();
            return;
        }

        const pkg = this.#pkg, version = this.#version;
        const source = `https://registry.npmjs.org/${pkg}/-/${pkg}-${version}.tgz`;
        await fs.mkdir(this.#path, {recursive: true});
        const {file: target} = this.target;

        const done = error => file.close(() => {
            error ? console.log(`Error downloading package "${pkg}@${version}": ${error.message}`) :
                console.log(`Package "${pkg}@${version}" was downloaded`);

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
    async process() {
        if (this.#promises.unzip) {
            await this.#promises.unzip;
            return;
        }

        const promise = this.#promises.unzip = new PendingPromise();

        // Check if file is already downloaded and unzipped
        const unzipped = await this.#unzipped();
        if (unzipped) {
            promise.resolve();
            return;
        }

        const vspecifier = (() => {
            const pkg = this.#pkg, version = this.#version;
            return `${pkg}@${version}`;
        })();

        // File must be previously downloaded
        try {
            await this.#fetch();
            const {file: source, dir: target} = this.target;

            console.log(`Extracting package "${vspecifier}" ...`);
            await require('./extract')(source, target);
            console.log(`Package "${vspecifier}" was extracted`);

            promise.resolve();
        }
        catch (exc) {
            console.log(`Error extracting package "${vspecifier}": ${exc.message}`);
            promise.reject(exc);
        }

        return await promise;
    }
}
