/**
 * Process module.json configuration
 *
 * @param input {object} The content of the module.json file
 * @returns {object} The post processed module configuration
 */
module.exports = function (input) {
	'use strict';

	const { bundler } = input;

	// All the configuration properties that are not reserved keys, are bundles
	const reserved = ['subpath', 'description', 'platforms', 'static'];

	// When the bundle is specified, convert it to {bundle: ...}
	if (!bundler) {
		output = input;
	} else {
		output[input.bundle] = input;

		// Move the following attributes to the level of the module configuration,
		// as they are not part of the bundle configuration
		reserved.forEach(property => {
			input[property] ? (output[property] = input[property]) : null;
			delete output[input.bundle][property];
		});

		delete output[input.bundle].bundle;
	}

	// Move the bundles to the .bundles attribute
	output.bundles = {};
	for (const attribute of Object.keys(output)) {
		if (attribute === 'bundles') continue;
		if (reserved.includes(attribute)) continue;
		output.bundles[attribute] = output[attribute];
		delete output[attribute];
	}

	return output;
};
