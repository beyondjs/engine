const fs = require('@beyond-js/fs');

/**
 * Compile package static resources
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The destination path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
	'use strict';

	builder.emit('message', 'Copying package static resources');

	const { package: pkg } = builder;
	await pkg.static.ready;

	const items = new Set();
	for (const resource of pkg.static) {
		items.add(`./${resource.relative.file.replace(/\\/g, '/')}`);

		const target = require('path').join(path, resource.relative.file);
		await fs.mkdir(require('path').dirname(target), { recursive: true });
		await fs.copyFile(resource.file, target);
	}

	return items;
};
