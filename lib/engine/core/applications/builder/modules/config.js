const { fs } = global.utils;

const getDistribution = (distribution, library) => {
	const distributions = [...library.deployment.distributions.values()];

	// The imports' entry of the distribution on which the resource is being requested is iterated
	// For each imports' entry, we iterate the builds of the internal dependency to know if the internal dependency has any distribution with the name configured in the imports
	if (distribution.imports.has(library.specifier)) {
		const dist = distribution.imports.get(library.specifier);
		return distributions.find(({ name }) => dist === name);
	}

	// Default - check if a distribution with the same name exists of the distribution on which the resource is being requested
	return distributions.find(({ name }) => distribution.name === name);
};

/**
 * Build config.js file of libraries/projects imported
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
	'use strict';

	if (distribution.npm) return;

	const { libraries } = builder.application;
	await libraries.ready;

	const promises = [];
	libraries.forEach(al => promises.push(al.ready));
	await Promise.all(promises);

	promises.length = 0;
	libraries.forEach(al => {
		if (!al.valid) {
			builder.emit(
				'error',
				`Internal library "${al.pkg}" was not found. 
				 Review the "libraries" property in the package.json file to make sure it is set correctly.
				 Also, validate that the package is configured in the beyond.json file`,
				{ main: true }
			);
			return;
		}

		const dist = getDistribution(distribution, al.library);
		if (!dist) {
			builder.emit(
				'error',
				`Distribution ${distribution.name} of the internal library "${al.pkg}" was not found. 
				 Review the "libraries" property in the package.json file to make sure it is set correctly.`,
				{ main: true }
			);
			return;
		}

		promises.push(al.library.config.get(dist).ready);
	});
	await Promise.all(promises);

	promises.length = 0;
	for (const al of libraries.values()) {
		// Not to build @beyond-js/local as it is only required in local environment
		if (al.pkg === '@beyond-js/local') continue;
		if (!al.valid) continue;

		builder.emit('message', `. Building "${al.specifier}" config.js file`);

		const dist = getDistribution(distribution, al.library);
		if (!dist) continue;

		const config = al.library.config.get(dist);
		const target = require('path').join(path, 'packages', al.vspecifier, `config.js`);
		promises.push(fs.save(target, config.code));
	}

	await Promise.all(promises);
};
