module.exports = class {
    #file;

    get root() {
        return this.#file.root;
    }

    get file() {
        return this.#file.file;
    }

    get dirname() {
        return this.#file.dirname;
    }

    get filename() {
        return this.#file.filename;
    }

    get basename() {
        return this.#file.basename;
    }

    get extname() {
        return this.#file.extname;
    }

    get relative() {
        return this.#file.relative;
    }

    constructor(file) {
        this.#file = file;
    }

    toJSON() {
        return this.#file.toJSON()
    }
}
