module.exports = {
	command: 'add [option]',
	description: 'Add a package or a module in beyondJS',
	handler: ({ option }) => {
		if (['module', 'package'].includes(option)) {
			require(`./${option}`)();
			return;
		}

		console.log('Command: beyond add [option] - Add a package or module in BeyondJS');
		console.log('option: package | module');
	}
};
