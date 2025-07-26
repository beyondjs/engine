const ipc = require('@beyond-js/ipc/main');
module.exports = async function (params) {
	return await ipc.exec('engine', 'applications/build', params);
};
