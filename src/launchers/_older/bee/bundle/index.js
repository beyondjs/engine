const Module = require('module');
const {SourceMap} = Module;

module.exports = class {
    #bundles;

    get project() {
        return this.#bundles.project;
    }

    get package() {
        return this.#bundles.package;
    }

    #is;
    get is() {
        return this.#is;
    }

    #uri;
    get uri() {
        return this.#uri;
    }

    #compiler;

    compile() {
        return this.#compiler.compile();
    }

    get exports() {
        if (!this.#compiler.compiled) throw new Error(`Bundle "${this.#uri}" not compiled`);
        return this.#compiler.exports;
    }

    get exc() {
        if (!this.#compiler.compiled) throw new Error(`Bundle "${this.#uri}" not compiled`);
        return this.#compiler.exc;
    }

    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    /**
     * NodeJS Module object constructor
     *
     * @param bundles {object} The collection of bundles
     * @param brequire {object} The beyond require
     * @param is {string} Can be 'transversal' or 'bundle'
     * @param uri {string} The uri of a bundle, or a hmr bundle
     * @param code {string} The bundle's code
     * @param map {object} The bundle's sourcemap
     */
    constructor(bundles, brequire, is, uri, code, map) {
        if (!is || !uri) {
            throw new Error('Invalid parameters');
        }
        if (!code || !map) {
            const error = (!code ? 'code' : '') + (!map && !code ? ' and ' : '') + (!map ? 'source map' : '');
            throw new Error(`Invalid ${error} of resource "${uri}"`);
        }

        this.#bundles = bundles;
        this.#is = is;
        this.#uri = uri;
        this.#code = require('./sourcemap')(code, map);
        this.#map = new SourceMap(map);
        this.#compiler = new (require('./compiler'))(this, brequire);
    }
}
