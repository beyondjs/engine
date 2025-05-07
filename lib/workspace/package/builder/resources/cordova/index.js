const fs = require('@beyond-js/fs');

/**
 * Build cordova config.xml & main.html (android only)
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
	'use strict';

	builder.emit('message', 'Building cordova configuration');

	let resources;
	try {
		const { package: pkg } = builder;
		resources = await pkg.resources.cordova(distribution.platform);
	} catch (e) {
		builder.emit('error', `  . ${e.stack}`);
	}

	if (!resources) return;

	for (const value of resources) {
		const { output, resource } = value;
		const target = require('path').join(path, output);
		await fs.mkdir(require('path').dirname(target), { recursive: true });

		if (resource.type === 'file') {
			await fs.copyFile(resource.file, target);
		} else if (resource.type === 'content') {
			await fs.save(target, resource.content);
		} else {
			throw new Error('Invalid resource type');
		}
	}

	// Create, copy icons and splash resources
	await require('./screens-icons')(builder, distribution, path);
};
