/**
 * Represent the txt bundle
 *
 * The text bundle is treat as a processor for this reason extends from
 * bundle object.
 *
 * @type {module.Bundle|{}}
 */
const {join} = require("path");
module.exports = class Text extends require('./bundle') {
    _identifier = 'txt';
    multilanguage = true;
    files = '*';

    _defaultName = 'texts.json';
    skeleton = [
        'path', 'multilanguage', 'files'
    ];

    _name = 'txt';

    constructor(module, specs = {}) {
        delete specs.processors;
        super(module, 'txt', specs);
        this._create = specs.create;
    }

    async create() {
        const tplPath = await this.templatesPath();
        const finalPath = join(tplPath, 'bundles', this._name);

        /**
         * if the folders exists the process is ignored.
         */
        const path = this.path === false ? this.file.dirname : this.file.file;
        if (!await this._fs.exists(path)) {
            await this._fs.copy(finalPath, path);
        }
    }

    async build() {
        this._create && await this.create();
    }
}