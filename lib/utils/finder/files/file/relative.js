module.exports = class {
    #file;
    get file() {
        return this.#file;
    }

    #dirname;
    get dirname() {
        return this.#dirname;
    }

    constructor(root, file) {
        if (file.substr(0, root.length) !== root) {
            console.log(file, root);
            throw new Error('Invalid relative file specification');
        }

        file = file.substr(root.length + 1);

        // Remove leading slash
        file = file.replace(/^[\/\\]/, '');
        this.#file = file;

        const dirname = require('path').dirname(file);
        this.#dirname = dirname === '.' ? '' : dirname;
    }
}
