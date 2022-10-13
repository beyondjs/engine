const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'module.exported';
    }

    #pkg;

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #platforms;
    get platforms() {
        return this.#platforms;
    }

    constructor(pkg, subpath) {
        super();
        this.#pkg = pkg;
        this.#subpath = subpath;
        this.#specifier = pkg.specifier + (subpath === '.' ? '' : subpath.slice(1));
        this.#vspecifier = pkg.vspecifier + (subpath === '.' ? '' : subpath.slice(1));
    }

    configure() {
        this.#platforms = [];
    }
}
