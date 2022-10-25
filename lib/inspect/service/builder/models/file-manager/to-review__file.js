const {sep, delimiter, join, relative, extname} = require("path");
const {existsSync, promises} = require("fs");
module.exports = class File {

    #content;
    #encoding = 'utf-8';
    /**
     * @property file.file Represents the filename
     * @properyy file.dirname Represents the relative dirname
     * @type {{file: string, dirname: string}}
     */
    #relative = {file: '', dirname: ''};
    get relative() {
        return this.#relative;
    }

    #root;
    get root() {
        return this.#root;
    }

    /**
     * @property #file {string} Represents the full pathname of the file including its own name
     */
    #file;
    get file() {
        return this.#file;
    }

    /**
     * @property dirname {pathname} Represents the directory of the file without the file name.
     */
    #dirname;
    get dirname() {
        return this.#dirname;
    }

    /**
     * @property filename {string} Name of the file without extension
     */
    #filename;
    get filename() {
        return this.#filename;
    }

    /**
     * @property extname {string} file extension.
     */
    #extname;
    get extname() {
        return this.#extname;
    }

    /**
     * @property basename {string} Full Name of the file, including extension
     */
    #basename = '';
    get basename() {
        return this.#basename;
    }

    /**
     * @property
     * @todo: doc
     */
    #path;
    get path() {
        return this.#path;
    }

    set path(value) {
        if (value === this.#path || typeof value !== 'string') return;
        this.#path = value;
    }

    get encoding() {
        return this.#encoding;
    }

    set encoding(value) {
        this.#encoding = value;
    }

    get content() {
        return this.#content;
    }

    set content(value) {
        const newValue = JSON.stringify(value);
        if (newValue === this.#content) return;
        this.#content = newValue;
    }

    get json() {
        try {
            if (!this.#content) return;
            return JSON.parse(this.#content);
        }
        catch (e) {
            console.trace("error getting json", this.#content, this.#file);
        }
    }

    #ready;
    get ready() {
        return this.#ready;
    }

    /**
     * todo: #julio
     * Currently, the file object does not support  receiving a full path as the only parameter. Fix it up.
     * @param dirname Represents the root path of the file
     * @param basename Represents the relative path of the file
     */
    constructor(dirname, basename) {
        if (!basename) basename = '';
        this.#path = dirname;

        this.setBasename(dirname, basename);
    }

    async #checkDirectory(dirname, basename) {
        if (basename) dirname = join(dirname, basename);
        const stat = await require('fs').promises.stat(dirname);
        if (stat.isDirectory()) {

            this.#dirname = dirname;
            this.#basename = '';
            return;
        }
        const split = dirname.split(sep);
        this.#basename = split.splice(-1).join(sep);
        this.#dirname = split.join(sep);
    }

    #promise;

    #execute = async (dirname, basename) => {
        try {
            console.log(0.2,(typeof dirname), dirname)
            console.log(0.3,(typeof basename), basename)
            if (typeof dirname === 'undefined' && typeof basename === 'undefined') {
                this.#ready = true;
                return;
            }
            if (typeof dirname !== 'string' || typeof basename !== 'string') {
                throw new Error('dirname and basename must be a string');
            }

            if (this.#ready && dirname === this.#dirname || dirname === this.#file) return;

            await this.#checkDirectory(dirname, basename);
            this.#file = join(this.#dirname, this.#basename);
            // todo @julio check if it's necessary.

            let relativeData = relative(this.#path, this.#file);

            const split = relativeData.split(sep);
            const file = split.splice(-1);
            this.#relative = {
                file: file.join(),
                dirname: split.length > 0 ? split.join(sep) : ''
            };
            this.#extname = extname(this.#basename);
            this.#filename = this.#basename.replace(this.#extname, '');
            this.#ready = true;

        }
        catch (e) {
            console.error(e)
        }
    }

    async setBasename(dirname, basename = '') {
        if (this.#promise) return this.#promise;
        let resolve, reject;
        this.#promise = new Promise((x, y) => {
            resolve = x;
            reject = y;
        });
        this.#execute(dirname, basename).then(() => {
            this.#promise = undefined;
            resolve(true);
        }).catch(e => console.error(e));

        return this.#promise;
    }

    /**
     * Return the absolute path of the file.x
     * @param file
     * @returns {*}
     * @private
     */
    getPath() {
        return this.file;
    }

    async read() {
        const {promises} = require('fs');
        // we need to check if the path is a file
        const element = await promises.stat(this.file);

        if (!element.isFile()) {
            return;
        }
        let content = await promises.readFile(this.file, {encoding: this.#encoding, flag: 'r'});
        this.#content = content;
        return content;
    }

    async readJSON() {
        await this.read();
        return this.json;
    }

    load() {
        console.log(59, this.#ready)
        if (this.#ready) return true;
        return this.setBasename(this.#dirname, this.#basename);
    }

    write(content, dest) {
        if (!content) content = this.#content;
        dest = dest ?? this.file;
        const {fs} = global.utils;
        return fs.savePromises(dest, content, this.#encoding);
    }

    writeJSON(content, dest) {
        return this.write(JSON.stringify(content, null, 2), dest);
    }

    /**
     * checks if file exist
     */
    validate(f) {
        const {existsSync} = require('fs');
        return existsSync(this.file);
    }

}
