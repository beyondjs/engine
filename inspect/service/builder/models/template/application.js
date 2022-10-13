module.exports = class extends require('./validator') {
    _processor;
    _path;
    _files;

    skeleton = ['processor', 'path', 'files'];

    constructor(config) {
        super();
        this.skeleton && this.skeleton.forEach(property => {
            if (!config.hasOwnProperty(property)) return;
            this[`_${property}`] = config[property];
        });
    }

    getContent() {
        const json = {};
        json.application = super.getContent();
        return json;
    }
}