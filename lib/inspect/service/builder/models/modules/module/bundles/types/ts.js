module.exports = class Ts extends require('./bundle') {
    _identifier = 'ts';

    skeleton = [];

    _processor = 'ts';

    constructor(module, specs = {}) {
        specs.alone = 'ts'
        super(module, 'ts', specs);
    }

}
