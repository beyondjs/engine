const {fs} = global.utils;
const Files = require('./files');
const File = require('../../files/file');

/**
 * An inclusion can be a wildcard, a file or a directory.
 * The way to use this class is by calling the .process() method. The execution can be cancelled by
 * calling the .destroy() method.
 * After calling the .process() method, the consumer should check if the object was destroyed while processing.
 */
module.exports = class extends Files {
    // The entry of the inclusion can be a file, a directory or the wildcard
    #entry;
    get entry() {
        return this.#entry;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    #TYPES = Object.freeze({
        DIRECTORY: 0,
        FILE: 1,
        WILDCARD: 2
    });
    get TYPES() {
        return this.#TYPES;
    }

    #type;
    get type() {
        return this.#type;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    /**
     * Finder inclusion constructor
     *
     * @param root {string} The root of the search, required to set the files relative directory
     * @param entry {string} The entry in the includes specification, each entry can be a directory,
     * a file, or the wildcard
     * @param specs {object} The finder specification
     */
    constructor(root, entry, specs) {
        if (typeof root === 'number') {
            // Occurs when the inclusion is created internally by javascript.
            // Example: When splice is executed, it returns an array of the elements being deleted.
            return super(root);
        }

        super(root, specs);
        this.#entry = entry;
        this.#specs = specs;
    }

    // The recursive search that is being executed
    #recursive;

    #wildcard = async () => {
        let excludes = this.#specs.includes.slice();
        excludes.splice(excludes.indexOf('*'), 1);
        this.#specs.excludes ? excludes = excludes.concat(this.#specs.excludes) : null;

        await this.#directory(this.root, excludes);
    }

    #directory = async (path, excludes) => {
        excludes = excludes ? excludes : this.#specs.excludes;
        this.#recursive = new (require('./recursive.js'))(this.root, path, {
            excludes: excludes,
            filename: this.#specs.filename,
            extname: this.#specs.extname,
            filter: this.#specs.filter
        });

        await this.#recursive.process();
        if (this.#destroyed) return;

        this.#errors = this.#recursive.errors.slice();
        !this.#errors.length && super.append(this.#recursive.files, /*sort*/ true);
        this.#recursive = undefined;
    }

    #file = async (file) => {
        file = new File(this.root, file);
        super.push(file, /*sort*/ true);
    }

    async process() {
        if (this.#processed) throw new Error('Inclusion was already processed');
        if (this.#processing) throw new Error('Inclusion is already being processed');
        if (this.#destroyed) throw new Error('Inclusion has been destroyed');

        this.#processing = true;

        try {
            if (this.#entry === '*') {
                this.#type = this.#TYPES.WILDCARD;
                await this.#wildcard();
                return;
            }

            const path = require('path').join(this.root, this.#entry);
            const exists = await fs.exists(path);
            if (this.#destroyed) return;
            if (!exists) return;

            let stat = await fs.stat(path);
            if (this.#destroyed) return;

            if (stat.isDirectory()) {
                this.#type = this.#TYPES.DIRECTORY;
                await this.#directory(path);
            }
            else if (stat.isFile()) {
                this.#type = this.#TYPES.FILE;
                await this.#file(path);
            }
        }
        catch (exc) {
            console.error(exc.stack);
            this.#errors.push(exc.message);
        }
        finally {
            this.#processing = false;
            this.#processed = true;
        }
    }

    /**
     * Called by the fs listener when a file is being added
     * @param file {string | object} The file being added
     */
    push(file) {
        if (!this.#processed && !this.#processing) {
            console.warn('Push file event received on a finder inclusion that was not initialised',
                file, this.root);
            return;
        }

        file = file instanceof File ? file : new File(this.root, file);
        if (this.#type !== this.#TYPES.WILDCARD) {
            // Check if the file being pushed should be included in the current inclusion
            const relative = require('path').relative(this.#entry, file.relative.file);
            if (relative.startsWith('..')) return;
        }
        return super.push(file, /*sort*/ true);
    }

    /**
     * Called by the fs listener when a file is being unlinked
     * @param file {string | object} The file being added
     */
    delete(file) {
        if (!this.#processed && !this.#processing) {
            console.warn('Delete file event received on a finder inclusion that was not initialised',
                file, this.root);
            return;
        }
        return super.delete(file);
    }

    destroy() {
        this.#destroyed = true;
        this.#recursive && this.#recursive.destroy();
    }
}
