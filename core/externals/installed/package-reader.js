const fs = require('beyond/utils/fs');
const {join} = require('path');

module.exports = class {
    #path;
    get path() {
        return this.#path;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #json;
    get json() {
        return this.#json;
    }

    #error;
    get error() {
        return this.#error;
    }

    constructor(path, vspecifier) {
        this.#path = path;
        this.#vspecifier = vspecifier;
    }

    async process() {
        try {
            const file = join(this.#path, 'package.json');
            const content = await fs.readFile(file, 'utf8');
            this.#json = JSON.parse(content);
        }
        catch (exc) {
            this.#error = exc.message;
        }
    }
}
