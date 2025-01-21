const fs = require('@beyond-js/fs');
const { join } = require('path');
module.exports = async function (modules, builder, paths, staticEntries, externals, distribution) {
	// save exports on package.json
	const exports = await require('./exports')(modules.exported, paths, distribution);

	const statics = {};
	for (const entries of Object.values(staticEntries)) {
		entries.forEach(i => (statics[i] = i));
	}

	const dependencies = await require('./dependencies')(builder, distribution);

	const { package: pkg } = builder;
	const { name, scope, version } = pkg;

	const clientDeps = new Set(
		dependencies.clientDependencies.concat(externals.client.size ? [...externals.client.values()] : [])
	);

	let packageJson = await fs.readFile(join(pkg.path, 'package.json'), 'utf8');
	packageJson = JSON.parse(packageJson);

	const json = {
		name: `${scope ? `@${scope}/` : ''}${name}`,
		version,
		static: statics,
		exports,
		dependencies: dependencies.items,
		devDependencies: dependencies.devDependencies,
		uimport: externals.all.size ? [...externals.all.values()] : true
	};
	clientDeps.size && (json.clientDependencies = [...clientDeps.values()]);

	const mergeObjects = (obj1, obj2) => {
		const result = Object.assign({}, obj1);
		for (let prop in obj2) {
			if (!obj2.hasOwnProperty(prop)) continue;
			result[prop] = obj2[prop];
		}
		return result;
	};
	const resultJson = mergeObjects(packageJson, json);

	delete resultJson.modules;
	delete resultJson.template;
	delete resultJson.languages;
	delete resultJson.layout;
	delete resultJson.deployment;

	const target = join(paths.www, 'package.json');
	await fs.save(target, JSON.stringify(resultJson, null, 2));
};
