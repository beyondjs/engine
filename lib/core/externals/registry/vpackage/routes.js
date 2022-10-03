const {sep} = require('path');

/**
 * Resolves if a file should be overwritten (browser input on web platform),
 * and identifies if it corresponds to an exported subpath.
 */
module.exports = class {
    #vpackage;

    constructor(vpackage) {
        this.#vpackage = vpackage;
    }

    resolve(file, {platform}) {
        file = sep !== '/' ? file.replace(/\\/g, '/') : file;

        console.log('resolving', file);
        // Resolves if the file should be overwritten on web platform
        file = platform !== 'web' ? file : (() => {
            const browser = this.#vpackage.json;
            return browser.has(file) ? browser.get(file) : file;
        })();

        const {exports} = this.#vpackage;
    }
}
