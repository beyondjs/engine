module.exports = async function (pkg, key, specs) {
	if (specs.declarations) {
		return {
			key: 'declarations-builder',
			name: 'declarations',
			maps: 'external',
			npm: true,
			environment: 'production',
			bundles: { mode: 'esm' },
			ts: { compiler: 'tsc' }
		};
	}

	if (key === 'npm') {
		return {
			key: 'npm-builder',
			name: 'npm',
			npm: true,
			maps: 'external',
			environment: 'production',
			ts: { compiler: 'tsc' }
		};
	}

	await pkg.ready;
	await pkg.deployment.ready;
	await pkg.deployment.distributions.ready;

	const id = key.split('//')[1];
	const { distributions } = pkg.deployment;

	return distributions.get(parseInt(id));
};
