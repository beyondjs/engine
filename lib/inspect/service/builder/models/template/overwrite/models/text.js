module.exports = class extends require('../../validator') {
    _path;
    _files;
    _multilanguage;

    skeleton = ['path', 'files', 'multilanguage'];

    constructor(config) {
        super();
        this.skeleton && this.skeleton.forEach(property => {
            if (!config.hasOwnProperty(property)) return;
            this[`_${property}`] = config[property];
        });
    }
}