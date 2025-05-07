const {
	platforms: { node },
} = global;

module.exports = async function ({ module, bundle, distribution, language }) {
	const packagers = new Map();
	const modulePlatforms = [...module.platforms.keys()];

	const setPackager = (platform, mode) => {
		const key = `${platform}//${mode}`;
		if (packagers.has(key)) return;

		const dist = Object.assign({}, distribution, {
			key,
			name: key,
			platform,
			bundles: { mode: mode },
		});
		delete dist.platforms;

		packagers.set(key, bundle.packagers.get(dist, language));
	};

	const hasNode = modulePlatforms.includes('node');
	for (const platform of modulePlatforms) {
		if (node.includes(platform)) {
			const key = hasNode ? 'node' : platform;
			setPackager(key, 'cjs');
			setPackager(key, 'esm');
			continue;
		}
		setPackager('web', 'amd');
		setPackager('web', 'sjs');
		setPackager('web', 'esm');
	}

	const promises = [];
	packagers.forEach(packager => packager.js && promises.push(packager.js.ready));
	await Promise.all(promises);

	return packagers;
};
