module.exports = class extends require('../validator') {
    _path;
    _files;

    skeleton = ['path', 'files'];

    constructor(id, config) {
        super();

        this._id = id;
        this.skeleton && this.skeleton.forEach(property => {
            if (!config.hasOwnProperty(property)) return;
            this[`_${property}`] = config[property];
        });
    }

    getContent() {
        const json = {};
        json[this._id] = super.getContent();
        return json;
    }
}