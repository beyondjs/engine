const ipc = require('@beyond-js/ipc/main');
module.exports = function () {
	this.update = params => ipc.exec('engine', 'modules/declarations/update', { id: params.id });
};
