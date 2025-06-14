const { Installer } = require('beyond/externals');
const { Config } = require('beyond/utils/config');
const packages = require('beyond/packages');
require('colors');

module.exports = {
	command: 'dependencies <install>',
	description: 'Processes the dependencies tree of a package and installs its dependencies',
	positionals: [
		{
			name: 'vname',
			type: 'string',
			optional: false,
			describe: 'The dependency to be installed including its version. Example: react@18.2.0'
		}
	],
	handler: async argv => {
		const { vname } = argv;
		if (!vname) {
			console.log('Please specify the dependency name and version (name@version) to be installed'.yellow);
			return;
		}

		/**
		 * Initialise the packages
		 */
		const config = new Config(process.cwd(), { '/packages': 'array' });
		config.data = 'beyond.json';
		packages.setup(config.get('packages'), { watchers: false });

		/**
		 * Run the installer
		 */
		const installer = new Installer(vname);
		await installer.install();
		if (!installer.valid) {
			installer.errors.forEach(error => console.log(error.red));
			return;
		}

		console.log(`Package "${vname}" is installed`);
	}
};
