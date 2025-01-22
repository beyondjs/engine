const fs = require('@beyond-js/fs');

/**
 * Build transversal start
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
	'use strict';

	builder.emit('message', 'Building start.js transversal file');

	// Build start.js
	const { package: pkg } = builder;
	await pkg.transversals.ready;
	const resource = pkg.transversals.get('start').packagers.get(distribution);
	await resource.js.ready;

	let { errors, valid } = resource.js;
	const startCode = resource.js.code();
	if (!valid) {
		builder.emit('error', 'Error on package start code');
		errors.forEach(error => builder.emit('error', `  -> ${error}`));
		return;
	}

	const target = require('path').join(path, 'start.js');
	if (distribution.minify.js) {
		let code, errors;
		({ code, errors } = uglifier.uglify('start.js', startCode));

		errors && builder.emit('error', 'Error uglifying package start');
		errors?.forEach(({ message, line, col }) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
		!errors && (await fs.save(target, code));
		return;
	}

	await fs.save(target, startCode);
};
