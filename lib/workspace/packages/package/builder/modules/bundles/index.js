/**
 * Build module bundles
 *
 * @param specs {builder, module, distribution, processSpecs}
 * @returns {Promise<void>}
 */
module.exports = async function (specs) {
	'use strict';

	const { bundles } = global;
	await bundles.ready;

	const { builder, module, distribution, processSpecs } = specs;
	await module.bundles.ready;

	const promises = [];
	[...module.bundles.values()].forEach(bundle => promises.push(bundle.ready));
	await Promise.all(promises);

	const build = async (bundle, language) => {
		const params = { ...specs, bundle, language };
		if (distribution.npm) {
			await require('./npm')(params);
			await require('./npm/css')(params);
			return;
		}

		await require('./bundle')('.js', params);
		processSpecs.build && (await require('./bundle')('.css', params));
	};

	promises.length = 0;
	for (const bundle of module.bundles.values()) {
		if (!!bundles.get(bundle.type).transversal) continue;

		builder.emit('message', `  -> Processing bundle "${bundle.type}"`);
		if (!bundle.multilanguage) {
			promises.push(build(bundle));
			continue;
		}
		const languages = builder.package.languages.supported;
		for (const language of languages) {
			promises.push(build(bundle, language));
		}
	}
	await Promise.all(promises);
};
