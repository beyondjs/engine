module.exports = class Code extends require('./bundle') {
    _identifier = 'code';

    constructor(module, specs = {}) {
        super(module, 'code', specs);
    }
}
