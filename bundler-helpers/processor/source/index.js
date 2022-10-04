const {relative} = require('path');
const cwd = process.cwd();

module.exports = class {
    #processor;
    get processor() {
        return this.#processor;
    }

    #distribution;
    #source;

    get id() {
        if (!this.#processor) return;

        const is = this.#is === 'source' ? '' : `${this.#is}//`;
        const {name, specs} = this.#processor;
        return `${specs.bundle.id}//${name}//${is}${this.#source.relative.file}`;
    }

    #url;
    get url() {
        if (this.#url !== void 0) return this.#url;

        let url = relative(cwd, this.#source.file);
        url = url.startsWith('..') ? '' : url;
        return this.#url = url;
    }

    #is;
    get is() {
        return this.#is;
    }

    get root() {
        return this.#source.root;
    }

    get file() {
        return this.#source.file;
    }

    get dirname() {
        return this.#source.dirname;
    }

    get filename() {
        return this.#source.filename;
    }

    get basename() {
        return this.#source.basename;
    }

    get extname() {
        return this.#source.extname;
    }

    get relative() {
        return this.#source.relative;
    }

    get content() {
        return this.#source.content;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    /**
     * Source constructor
     *
     * @param processor {object} The processor object
     * @param distribution {object} The distribution specification
     * @param is {string} Can be 'source' or 'overwrite'
     * @param source? {object} Optional. If undefined, the source object is set when it is hydrated
     */
    constructor(processor, distribution, is, source) {
        if (typeof is !== 'string') throw new Error('Invalid parameters');
        if (!distribution.platform) throw new Error('Invalid parameters');

        this.#processor = processor;
        this.#distribution = distribution;
        this.#is = is;

        this.#source = source;
        this.#hash = source?.hash;
    }

    hydrate(cached) {
        this.#source = cached;
        this.#hash = cached.hash;
    }

    toJSON() {
        const relative = {dirname: this.relative.dirname, file: this.relative.file};
        const {is, url, root, file, dirname, filename, basename, extname, content, hash} = this;
        return {is, url, root, file, dirname, filename, basename, extname, relative, content, hash};
    }
}
