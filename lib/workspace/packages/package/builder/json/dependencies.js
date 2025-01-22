const p = require('path');
const {
	utils: { fs },
	platforms: { webAndMobile }
} = global;

module.exports = async function (builder, { npm, platform }) {
	if (!npm && webAndMobile.includes(platform)) {
		return {};
	}

	const items = {};
	const { package: pkg } = builder;
	const packageJson = await fs.readFile(p.join(pkg.path, 'package.json'), 'utf8');
	let { dependencies, devDependencies, clientDependencies } = JSON.parse(packageJson);
	dependencies &&
		Object.keys(dependencies).forEach(i => {
			if (!!(clientDependencies && clientDependencies.includes(i))) return;
			items[i] = dependencies[i];
		});

	!clientDependencies && (clientDependencies = []);
	return { items, devDependencies, clientDependencies };
};
