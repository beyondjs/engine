const {PendingPromise} = require('uimport/utils');
const {promises: fs, unlink, createWriteStream} = require('fs');
const https = require('https');
const {join} = require('path');

module.exports = class {
    #vpackage;
    #specs;

    constructor(vpackage, specs) {
        if (!specs?.cache) throw new Error('Invalid specification');

        this.#vpackage = vpackage;
        this.#specs = specs;
    }

    get target() {
        // Check if package is already downloaded
        const {name, version} = this.#vpackage;
        const dir = join(this.#specs.cache, `${name}@${version}`);
        const file = join(this.#specs.cache, `${name}@${version}.tgz`);
        return {file, dir};
    }

    /**
     * Check if vpackage is already downloaded
     */
    async #downloaded() {
        const {file} = this.target;
        return await new Promise(resolve =>
            fs.access(file).then(() => resolve(true)).catch(() => resolve(false)));
    }

    /**
     * Check if vpackage is already downloaded and unzipped
     */
    async #unzipped() {
        const {dir} = this.target;
        return await new Promise(resolve =>
            fs.access(dir).then(() => resolve(true)).catch(() => resolve(false)));
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

        const {name, version} = this.#vpackage;
        const source = `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`;
        await fs.mkdir(this.#specs.cache, {recursive: true});
        const {file: target} = this.target;

        const done = error => file.close(() => {
            error ? unlink(target, () => promise.reject(error)) : promise.resolve();
        });

        const file = createWriteStream(target);

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

        // Check if file is already downloaded
        const unzipped = await this.#unzipped();
        if (unzipped) {
            promise.resolve();
            return;
        }

        // File must be previously downloaded
        try {
            await this.#fetch();
            const {file: source, dir: target} = this.target;
            await require('./extract')(source, target);
            promise.resolve();
        }
        catch (exc) {
            promise.reject(exc);
        }

        return await promise;
    }
}
