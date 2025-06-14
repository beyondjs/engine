const PackageInstaller = require('beyond/packages/installer');
const { PackageSpecifier } = require('@beyond-js/specifier-parser/main');
require('colors');

module.exports = {
	command: 'package install <vname>',
	description: 'Installs a specific package',
	handler: async argv => {
		const { vname } = argv;
		if (!vname) {
			console.log('Please specify the package name and version (name@version) to be installed'.yellow);
			return;
		}

		const specifier = new PackageSpecifier(vname);
		if (!specifier.valid) {
			console.log(`The package name "${vname}" is not valid`.red);
			return;
		}
		if (!specifier.version) {
			console.log(`The package name "${vname}" must include a version (name@version)`.red);
			return;
		}

		/**
		 * Run the installer
		 */
		const { pkg: name, version } = specifier;
		console.log(`Installing package "${name}@${version}"...`.green);
		const installer = new PackageInstaller(name, version);

		try {
			await installer.install();
		} catch (error) {
			console.log(`Error installing package "${vname}": ${error.message}`.red);
			return;
		}

		if (!installer.valid) {
			installer.errors.forEach(error => console.log(error.red));
			return;
		}

		console.log(`Package "${vname}" is installed`);
	}
};
