module.exports = function () {
	const ipc = require('@beyond-js/ipc/main');
	this.update = params => ipc.exec('engine', 'applications/declarations/update', params);
	this.updateAll = params => ipc.exec('engine', 'applications/declarations/updateAll', params);
};
