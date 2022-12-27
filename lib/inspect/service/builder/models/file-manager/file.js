const { sep, join, relative, extname } = require("path");
const { existsSync, promises } = require("fs");
module.exports = class File {
    #content;
    #encoding = "utf-8";
    /**
     * @property file.file Represents the filename
     * @properyy file.dirname Represents the relative dirname
     * @type {{file: string, dirname: string}}
     */
    #relative = { file: "", dirname: "" };
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
    #basename;
    get basename() {
        return this.#basename;
    }

    #path;
    get path() {
        return this.#path;
    }

    set path(value) {
        if (value === this.#path || typeof value !== "string") return;
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
            if (!this.#content) {
                console.log("sin contenido...");
                return;
            }

            return JSON.parse(this.#content);
        } catch (e) {
            console.trace("error getting json", this.#content, this.#file, this.#relative);
        }
    }

    constructor(dirname, basename) {
        this.#path = dirname;
        this.#dirname = dirname;
        this.setBasename(basename);
    }

    setBasename(name) {
        if (name === this.#basename || typeof name !== "string") return;
        this.#basename = name;
        this.#file = join(this.#path, this.#basename);
        const relativeData = relative(this.dirname, this.#file);

        const split = relativeData.split(sep);
        const file = split.splice(-1);
        this.#relative = {
            file: file.join(),
            dirname: split.length > 0 ? split.join(sep) : "",
        };
        this.#extname = extname(this.#basename);
        this.#filename = this.#basename.replace(this.#extname, "");
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
        const { promises } = require("fs");
        // we need to check if the path is a file
        const element = await promises.stat(this.file);
        if (!element.isFile()) {
            return;
        }
        let content = await promises.readFile(this.file, { encoding: this.#encoding, flag: "r" });
        this.#content = content;
        return content;
    }

    async readJSON() {
        await this.read();
        return this.json;
    }

    write(content, dest) {
        if (!content) content = this.#content;
        dest = dest ?? this.file;
        const { fs } = global.utils;
        return fs.savePromises(dest, content, this.#encoding);
    }

    writeJSON(content, dest) {
        return this.write(JSON.stringify(content, null, 2), dest);
    }

    /**
     * check if file exist
     */
    validate(f) {
        const { existsSync } = require("fs");
        return existsSync(this.file);
    }
};
