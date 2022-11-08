const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.export';
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    get id() {
        return `${this.#pkg.id}//${this.#subpath}`;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    constructor(pkg, subpath) {
        super();
        this.#pkg = pkg;
        this.#subpath = subpath;
        this.#specifier = pkg.specifier + (subpath === '.' ? '' : subpath.slice(1));
        this.#vspecifier = pkg.vspecifier + (subpath === '.' ? '' : subpath.slice(1));
    }
}
