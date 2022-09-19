module.exports = class extends require('../file-manager') {

    skeleton = [
        'path',
        'externals'
    ];

    #file;
    #externals;

    get structure() {
        const structure = {path: this.path};
        const externals = this.#externals.structure;
        if (externals) structure.externals = externals;

        return structure;
    }

    constructor(path, basename) {
        super(path, basename);
        this.#externals = new (require('./externals'))();
    }

    set(data) {
        if (data.externals) {
            this.#externals.set(data.externals);
            delete data.externals;
        }
        this._checkProperties(data);
        const path = this.path ?? 'modules';
        this.file.setBasename(path);

    }

    setDefault() {
        this.path = require('path').join(this.file.dirname, 'modules');
        this.file.setBasename('modules');
    }
}
