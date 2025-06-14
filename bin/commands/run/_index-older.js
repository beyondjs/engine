require('colors');
require('../../lib/global');
const ports = require('@beyond-js/ports');

const start = argv => {
	const done = ({ error, params }) => {
		if (error) {
			console.log('Cannot run BeyondJS:'.red, error);
			return;
		}

		params = params ? params : {};
		new (require('beyond'))(params);
	};

	const { inspector } = argv;
	if (inspector) {
		ports
			.check(inspector)
			.then(ok =>
				ok
					? done({ params: { inspect: inspector } })
					: done({
							error: `Inspector port ${inspector} is already in use, add --inspector [value] to define a specific port`
					  })
			)
			.catch(exc => done(exc.message));
	} else {
		done({});
	}
};

module.exports = {
	command: 'run [inspector]',
	description: 'Run the BeyondJS packages engine and server',
	options: [
		{
			name: 'inspector',
			type: 'number',
			default: 4000,
			optional: true,
			describe: 'The port on which the http inspector will work'
		}
	],
	handler: start
};
