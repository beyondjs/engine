const path = require('path');
const fs = require('fs/promises');

module.exports = class PackagesCache {
    #path;

    constructor(path) {
        if (!path) throw new Error('Cache path specification not received');
        this.#path = path;
    }

    async load(name) {
        const file = path.join(this.#path, `${name}.json`);
        const exists = await new Promise(resolve =>
            fs.access(file).then(() => resolve(true)).catch(() => resolve(false)));
        if (!exists) return;

        const content = await fs.readFile(file);
        return JSON.parse(content);
    }

    async save(name, json) {
        const file = path.join(this.#path, `${name}.json`);

        await fs.mkdir(this.#path, {recursive: true});
        await fs.writeFile(file, JSON.stringify(json));

        console.log(`Package metafile saved into cache on "${file}"`);
    }
}
