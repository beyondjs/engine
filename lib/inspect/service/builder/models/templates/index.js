const {join} = require('path');
const globalDirs = require('global-dirs');

module.exports = class Templates {
    #path;
    #ready;
    static #instance;

    get ready() {
        return this.#ready;
    }

    get path() {
        return this.#path;
    }

    get packageTemplates() {
        return '@beyond-js/packages-templates';
    }

    constructor(path) {
        if (path) {
            this.#ready = true;
            this.#path = path;
            return;
        }
        this.#getPath();
    }

    #getPath() {
        // get the templates from the @beyond-js/packages-templates package
        this.#path = join(globalDirs.npm.packages, this.packageTemplates, 'templates');
        return this.#ready = true;
    }

    load() {
        return this.#getPath();
    }

    ipc() {
        return require('../../../ipc-manager');
    }

    static get(path) {
        if (!Templates.#instance) {
            Templates.#instance = new Templates(path);
        }
        return Templates.#instance;
    }
}
