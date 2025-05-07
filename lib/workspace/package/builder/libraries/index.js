const {
	utils: { fs },
	platforms: { node }
} = global;

/**
 * Compile libraries static resources
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The destination path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
	'use strict';

	if (distribution.npm || node.includes(distribution.platform)) return;

	builder.emit('message', 'Copying libraries static resources');

	const { package: pkg } = builder;
	await pkg.libraries.ready;
	for (const library of pkg.libraries.values()) {
		await library.static.ready;

		for (let resource of library.static.values()) {
			const relative = resource.file.relative.file;
			resource = resource.overwrite ? resource.overwrite : resource.file;
			const target = require('path').join(path, 'packages', library.vspecifier, relative);
			await fs.mkdir(require('path').dirname(target), { recursive: true });
			await fs.copyFile(resource.file, target);
		}
	}
};
