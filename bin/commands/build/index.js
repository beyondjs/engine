require('colors');
require('../../../lib/global');

const { ipc } = global.utils;
const exec = async (action, params) => ipc.exec('engine', action, params);

/**
 * @var SHOWTRACE
 * show the logs by console only executing this process
 */
let SHOWTRACE;
ipc.events.on('engine', 'project-process', message => {
	if (!SHOWTRACE) return;

	const { type } = message;
	if (!['process'].includes(type)) {
		console.error(`Invalid application-process type "${type}"`);
		return;
	}
	console.log(message.id, message.text);
});

const build = async argv => {
	const { pkg, distribution, declarations } = argv;

	if (!pkg) {
		console.log(`Specify the package name`.red);
		return;
	}
	if (!distribution) {
		console.log(`Specify the name of the distribution to compile the package`.red);
		return;
	}

	// Run BeyondJS
	new (require('beyond'))({});

	const applications = await exec('applications/list');
	const application = Object.values(applications).find(app => app.name === pkg);
	if (!application) {
		console.log(`Package "${pkg}" not found, check beyond.json file`.red);
		process.exit(1);
	}

	const deployments = await exec('applications/deployments/get', [application.id]);
	const deploy = deployments[application.id];
	if (!deploy) {
		console.log(`The "${pkg}" package has no implementation configured, check the package.json`.red);
		process.exit(1);
	}

	const distributions = await exec('applications/distributions/get', deploy.distributions);
	const dist = Object.values(distributions).find(d => d.name === distribution);
	if (!dist) {
		console.log(
			`Distribution "${distribution}" not found, check the package.json file of the "${pkg}" package`.red
		);
		process.exit(1);
	}

	SHOWTRACE = true;
	await exec('applications/process', {
		application: application.id,
		distribution: dist.id,
		build: true,
		declarations,
	});

	process.exit(0);
};

module.exports = {
	command: 'build [pkg] [distribution]',
	description: 'Builds a package according to the distribution specified',
	options: [
		{
			name: 'pkg',
			type: 'string',
			describe: 'The name of the package to compile',
		},
		{
			name: 'distribution',
			type: 'string',
			describe: 'The distribution with which the package will be compiled',
		},
	],
	handler: build,
};
