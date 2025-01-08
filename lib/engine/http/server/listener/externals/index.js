const { join } = require('path');
const { platforms } = global;

module.exports = async function (url, application, distribution) {
	'use strict';

	if (platforms.node.includes(distribution.platform)) {
		return new global.Resource({ 500: 'External package is not supported if execution environment is "node"' });
	}

	let { pathname } = url;
	if (!pathname.startsWith('/packages/')) return;

	const { resource, pkg, ext } = require('./parser')(pathname);

	if (ext === '.d.ts') {
		return new global.Resource({ 500: 'External package extension .d.ts actually not supported' });
	}

	// Check if package is an application library
	await application.libraries.ready;
	if (application.libraries.has(pkg)) return;

	const specs = {
		cwd: application.path,
		temp: join(application.path, '.beyond/uimport'),
		cache: join(process.cwd(), '.beyond/uimport'),
		versions: distribution.platform !== 'deno'
	};
	const { mode } = distribution.bundles;
	const { code, map, dependencies, errors } = await require('@beyond-js/uimport')(resource, mode, specs);

	const info = url.searchParams.has('info');
	if (info) {
		return await require('./info')(errors, dependencies);
	}

	if (errors) {
		return new global.Resource({ 500: `External resource has been processed with errors` });
	}

	let content = ext === '.js.map' ? map : code;
	content = content ? content : '';
	return new global.Resource({ content, extname: ext });
};
