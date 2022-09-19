module.exports = class extends require('../../validator') {
    _files;

    skeleton = ['files'];

    constructor(config) {
        super();
        this.skeleton && this.skeleton.forEach(property => {
            if (!config.hasOwnProperty(property)) return;
            this[`_${property}`] = config[property];
        });
    }
}