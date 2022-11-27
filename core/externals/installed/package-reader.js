const fs = require('beyond/utils/fs');
const {join} = require('path');

module.exports = class {
    #path;
    get path() {
        return this.#path;
    }

    #vname;
    get vname() {
        return this.#vname;
    }

    #json;
    get json() {
        return this.#json;
    }

    #error;
    get error() {
        return this.#error;
    }

    constructor(path, vname) {
        this.#path = path;
        this.#vname = vname;
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
