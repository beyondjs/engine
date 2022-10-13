module.exports = class Start extends require('./bundle') {
    _identifier = 'start';

    skeleton = [];

    constructor(module, specs = {}) {
        super(module, 'start', specs);
    }

}
