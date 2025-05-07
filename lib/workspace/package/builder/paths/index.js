const fs = require('@beyond-js/fs');
const p = require('path');

module.exports = async function (builder, distribution, build) {
	const { package: pkg } = builder;
	await pkg.deployment.ready;
	const target = pkg.deployment?.build?.path ?? '.beyond/builds';

	const paths = {};
	paths.builds = p.join(pkg.path, target);
	paths.base = p.join(paths.builds, distribution.name);
	paths.build = p.join(paths.base, 'code');
	paths.archive = p.join(paths.base, 'build.zip');

	const {
		platforms: { mobile }
	} = global;
	const www = mobile.includes(distribution.platform) ? 'www' : '';
	paths.www = p.join(paths.build, www);

	const buildDirectory = async () => {
		if (await fs.exists(paths.base)) {
			builder.emit('message', `A previous build was found on "${paths.base}"`);
			builder.emit('message', 'Removing all content of the previous build');
			await fs.promises.rm(paths.base, { recursive: true });
			builder.emit('message', 'Previous build removed');
		} else builder.emit('message', `Build is being processed on "${paths.base}"`);

		if (await fs.exists(paths.base)) {
			throw new Error(`Directory "${paths.base}" must be empty before building package`);
		}

		// Append the build data to the builds storage
		const { builds } = builder;
		await builds.append(paths, distribution);

		// Create the target directory
		await fs.mkdir(paths.build, { recursive: true });
	};
	build && (await buildDirectory());

	return paths;
};
