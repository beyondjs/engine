module.exports = class Bridge extends require('./bundle') {
    _identifier = 'bridge';

    skeleton = [];

    _processor = 'ts';

    constructor(module, specs = {}) {
        specs.alone = 'ts';
        super(module, 'bridge', specs);
    }

}
