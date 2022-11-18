const {dirname, basename, extname} = require('path');

module.exports = class {
    #root;
    get root() {
        return this.#root;
    }

    #file;
    get file() {
        return this.#file;
    }

    #relative;
    get relative() {
        return this.#relative;
    }

    #dirname;
    get dirname() {
        this.#dirname = this.#dirname !== void 0 ? this.#dirname : dirname(this.#file);
        return this.#dirname;
    }

    #filename;
    get filename() {
        this.#filename = this.#filename !== void 0 ? this.#filename : basename(this.#file);
        return this.#filename;
    }

    #basename;
    get basename() {
        this.#basename = this.#basename !== void 0 ? this.#basename : basename(this.#file, this.#extname);
        return this.#basename;
    }

    #extname;
    get extname() {
        this.#extname = this.#extname !== undefined ? this.#extname : extname(this.#file);
        return this.#extname;
    }

    constructor(root, file) {
        root && this.#set({root, file});
    }

    #set({root, file}) {
        if (typeof root !== 'string' || typeof file !== 'string' || !root || !file) {
            throw new Error('Parameters "root" and "file" are both required');
        }

        // root = root.startsWith('./') || root.startsWith('.\\') ? root.slice(2) : root;
        if (root.startsWith('.') || file.startsWith('.')) {
            throw new Error('Parameters "root" and "file" must be absolute paths');
        }

        // Remove trailing slashes
        root = root.replace(/([\/\\])+$/, '');
        this.#root = root;
        this.#file = file;
        this.#relative = new (require('./relative'))(root, file);
    }

    hydrate(cached) {
        return this.#set(cached);
    }

    toJSON() {
        const {root, file} = this;
        return {root, file};
    }
}
