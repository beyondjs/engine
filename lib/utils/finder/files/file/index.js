const path = require('path');

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
        this.#dirname = this.#dirname !== undefined ? this.#dirname :
            path.dirname(this.file);
        return this.#dirname;
    }

    #filename;
    get filename() {
        this.#filename = this.#filename !== undefined ? this.#filename :
            path.basename(this.file);
        return this.#filename;
    }

    #basename;
    get basename() {
        this.#basename = this.#basename !== undefined ? this.#basename :
            path.basename(this.file, this.extname);
        return this.#basename;
    }

    #extname;
    get extname() {
        this.#extname = this.#extname !== undefined ? this.#extname :
            path.extname(this.file);
        return this.#extname;
    }

    constructor(root, file) {
        if (typeof root !== 'string' || typeof file !== 'string' || !root || !file) {
            throw new Error('Parameters root and file are both required');
        }

        // Remove trailing slashes
        root = root.replace(/([\/\\])+$/, '');
        this.#root = root;
        this.#file = file;
        this.#relative = new (require('./relative'))(root, file);
    }

    toJSON = () => ({
        file: this.file,
        dirname: this.dirname,
        filename: this.filename,
        basename: this.basename,
        extname: this.extname,
        relative: {
            file: this.#relative.file,
            dirname: this.#relative.dirname
        }
    });
}
