const { installed } = require('beyond/packages/installed');

module.exports = {
	command: 'dependencies <list>',
	description: 'List the installed dependencies',
	handler: async () => {
		await installed.ready;
		console.log([...installed.keys()]);
	}
};
