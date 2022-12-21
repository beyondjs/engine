const File = require('./file');

/**
 * An array of files with unique relative paths.
 * It is an array because it is required to keep the order of the files.
 */
module.exports = class extends Array {
    #root;
    get root() {
        return this.#root;
    }

    #keys = new Set();  // The relative paths of the files

    constructor(root) {
        if (typeof root === 'number') {
            // Occurs when the inclusion is created internally by javascript.
            // Example: When splice is executed, it returns an array of the elements being deleted.
            return super(root);
        }

        super();
        this.#root = root;
    }

    sort() {
        return super.sort((a, b) => a.relative.file < b.relative.file ? -1 : 1);
    }

    /**
     * Push a file to the array
     * @param file {object} The file object
     * @param sort {boolean}
     */
    push(file, sort) {
        file = this._getFileObject(file);

        if (this.includes(file)) return; // File already exists in the array

        this.#keys.add(file.relative.file);
        super.push(file);
        sort && this.sort();
        return file;
    }

    clear() {
        this.#keys.clear();
        this.length = 0;
    }

    reset(root) {
        this.clear();
        this.#root = root;
    }

    delete(file) {
        if (!this.#root) return;

        file = this._getFileObject(file);
        if (!this.includes(file)) return;

        const index = this.indexOf(file);
        super.splice(index, 1);
        this.#keys.delete(file.relative.file);
        return true;
    }

    /**
     * Returns a file object
     *
     * @param file {string | object} If a file object is passed, this function just returns it,
     * otherwise it creates a File and returns it
     */
    _getFileObject = (file) => {
        if (!this.#root) throw new Error('Files is not configured');

        if (file instanceof File) return file;
        if (typeof file !== 'string') throw new Error('Invalid file parameter');

        const p = require('path');
        file = p.isAbsolute(file) ? file : p.join(this.#root, file);
        return new File(this.#root, file);
    }

    /**
     * The key of a file is its relative path
     *
     * @param file {string | object} Can be the relative path of the file, the absolute path or a file object
     * @returns {string} The relative path of the file
     */
    #getKey = (file) => {
        if (typeof file === 'string') {
            if (!require('path').isAbsolute(file)) return file;
            file = new File(this.#root, file);
            return file.relative.file;
        }
        if (file instanceof File) return file.relative.file;
        throw new Error('Invalid file parameter');
    }

    includes(file) {
        if (!this.#root) return false;
        return this.#keys.has(this.#getKey(file));
    }

    indexOf(file) {
        if (!this.#root) return -1;
        if (!(file instanceof File) && typeof file !== 'string') throw new Error('Invalid file type');

        for (const [index, value] of this.entries()) {
            let key, absolute;
            if (file instanceof File) {
                key = file.relative.file;
                absolute = false;
            }
            else {
                absolute = require('path').isAbsolute(file);
                key = file;
            }

            if ((absolute ? value.file : value.relative.file) === key) return index;
        }
        return -1;
    }

    find(file) {
        if (!this.#root || !this.includes(file)) return;
        return this[this.indexOf(file)];
    }

    append(files, sort) {
        if (!this.#root) throw new Error('Files is not configured');

        const Files = require('./');
        if (!(files instanceof Files)) throw new Error('Invalid parameters');
        files.forEach(file => this.push(file, false));
        sort && this.sort();
    }
}
