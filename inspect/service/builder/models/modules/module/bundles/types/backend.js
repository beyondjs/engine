module.exports = class Backend extends require('./bundle') {
    _identifier = 'backend';

    skeleton = ['path', 'files'];

    constructor(module, specs = {}) {
        super(module, 'backend', specs);
    }

}
