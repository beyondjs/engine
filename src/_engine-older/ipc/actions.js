const packages = [
	'packages/get',
	'packages/list',
	'packages/ready',
	'packages/process',
	'packages/static/get',
	'packages/static/list',
	'packages/declarations/update',
	'packages/declarations/updateAll',
	'packages/deployments/list',
	'packages/deployments/get',
	'packages/distributions/list',
	'packages/distributions/get',
	'packages/modules/get',
	'packages/modules/list',
	'packages/modules/count'
];

const modules = ['modules/get', 'modules/static/get', 'modules/static/list', 'modules/declarations/update'];
const bundles = [
	'bundles/get',
	'bundles/consumers/get',
	'bundles/consumers/list',
	'bundles/packagers/get',
	'bundles/packagers/list',
	'bundles/packagers/compilers/get'
];
const processors = [
	'processors/get',
	'processors/sources/list',
	'processors/sources/get',
	'processors/compilers/get',
	'processors/overwrites/list',
	'processors/overwrites/get',
	'processors/dependencies/list',
	'processors/dependencies/get'
];
const templates = ['templates/overwrites/get', 'templates/overwrites/list', 'templates/overwrites/path'];
const other = ['server/wd', 'server/config', 'declarations/get', 'global-bundles/get', 'global-bundles/list'];

module.exports = packages.concat(modules, bundles, processors, templates, other);
