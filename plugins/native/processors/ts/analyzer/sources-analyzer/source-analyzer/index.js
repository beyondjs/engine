const Dependencies = require('./dependencies');
const Exports = require('./exports');

/**
 * Extract the dependencies and exports of a typescript source code
 *
 * @param file {string} The relative path of the file
 * @param content {string} The content of the file
 * @return {{dependencies: Map, exports: Set}}
 */
module.exports = class {
    #file;
    get file() {
        return this.#file;
    }

    #dependencies = new Map();
    get dependencies() {
        return this.#dependencies;
    }

    #exports = new Map();
    get exports() {
        return this.#exports;
    }

    constructor(file, ast) {
        this.#file = file;
        this.#dependencies = new Dependencies(ast);
        this.#exports = new Exports(ast);
    }
}
