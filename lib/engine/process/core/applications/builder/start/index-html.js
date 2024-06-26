const { fs } = global.utils;

/**
 * Build index.html file
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
	'use strict';

	builder.emit('message', 'Building index.html file');

	// Build index.html
	const { application } = builder;
	const resource = await application.resources.index.content(distribution);
	if (resource.errors?.length) {
		builder.emit('error', 'Error building index.html file');
		return;
	}

	const target = require('path').join(path, 'index.html');
	if (distribution.minify.html) {
		let html, errors;
		({ html, errors } = uglifier.uglify('index.html', resource.html));
		errors ? builder.emit('error', 'Error uglifying index.html file') : await fs.save(target, html);
		return;
	}

	await fs.save(target, resource.html);
};
