module.exports = class Start extends require('./bundle') {
	_identifier = 'start';

	skeleton = ['bundle'];

	constructor(module, specs = {}) {
		super(module, 'start', specs);
	}
};
