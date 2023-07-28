const { exec } = require('child_process');

/**
 *
 * gets the global directory where npm packages are installed
 *
 * @returns string
 */
module.exports = () => {
	return new Promise((resolve, reject) => {
		exec('npm root -g', (error, stdout, stderr) => {
			if (error) {
				console.error('Error getting global directory from npm:', error);
				resolve(false);
				return;
			}
			resolve(stdout.trim());
		});
	}).catch(e => console.trace(e.stack));
};
