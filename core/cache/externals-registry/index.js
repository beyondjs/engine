const {join} = require('path');
const fs = require('beyond/utils/fs');

module.exports = class {
    #path;
    #file;

    #value;
    get value() {
        return this.#value;
    }

    constructor(name) {
        this.#path = join(process.cwd(), `.beyond/externals/registry`);
        this.#file = join(this.#path, `${name}.json`);
    }

    async load() {
        const exists = await fs.exists(this.#file);
        if (!exists) return;

        try {
            const content = await fs.readFile(this.#file);
            this.#value = JSON.parse(content);
        }
        catch (exc) {
            console.log(`Error loading package metadata from cache: ${exc.message}`);
        }
    }

    save(value) {
        this.#value = value;

        fs.mkdir(this.#path, {recursive: true})
            .then(() => {
                return fs.writeFile(this.#file, JSON.stringify(value));
            })
            .catch(exc => {
                console.log(`Error saving package metadata to cache: ${exc.message}`);
            });
    }
}
