const { Resource } = global;
const fs = require('@beyond-js/fs');
const p = require('path');
const qs = require('querystring');

module.exports = async function (application, distribution, url) {
	const split = url.pathname.slice(1).split('/');
	const file = split.pop();

	if (!['config.js', 'config.json', 'config.d.ts'].includes(file)) return;

	const { project, resource } = await (async () => {
		if (!split.length) return { project: application };
		if (split.shift() !== 'packages') return {};

		const { pkg, version, error } = (() => {
			const scope = split[0].startsWith('@') ? split.shift() : void 0;
			const [name, version] = split.shift().split('@');

			const node = platforms.node.includes(distribution.platform);
			if (!node && !version) {
				return { error: 'Package version must be specified' };
			}

			const pkg = scope ? `${scope}/${name}` : name;
			return { pkg, version };
		})();
		if (error) return { resource: new Resource({ 500: error }) };

		const { libraries } = application;
		await libraries.ready;
		if (!libraries.has(pkg)) {
			// It is not a config bundle from an imported project, but it still can be an external bundle
			return {};
		}

		const al = libraries.get(pkg);
		await al.ready;

		if (version && al.version !== version) {
			const error = !al.valid
				? `Dependency "${al.pkg}" is invalid, check that it is installed or configured`
				: `Version "${version}" differs from the registered version of the dependency "${al.version}"`;
			return { resource: new Resource({ 500: error }) };
		}

		return { project: al.library };
	})();
	if (resource) return resource;
	if (!project) return;

	let dist = distribution;
	// Validates if the resource being requested is an internal dependency
	if (project.package !== application.specifier) {
		const distributions = [...project.deployment.distributions.values()];
		const validateImports = () => {
			// The imports' entry of the distribution on which the resource is being requested is iterated
			// For each imports' entry, we iterate the builds of the internal dependency to know if the internal dependency has any distribution with the name configured in the imports
			const found = distribution.imports?.forEach(dist => distributions.find(({ name }) => dist === name));
			if (found) return found;

			// Default - check if a distribution with the same name exists of the distribution on which the resource is being requested
			return distributions.find(({ name }) => distribution.name === name);
		};

		dist = validateImports();
		if (!dist) {
			return new global.Resource({
				404: 'Resource not found.\n' + `Not found external package config "${project.package}".`
			});
		}
	}

	const config = project.config.get(dist, true);
	await config.ready;

	const info = qs.parse(url.search.slice(1)).info !== void 0;
	if (info) return await require('./info')(config);
	if (!config.valid) return new Resource({ 500: `Project configuration is invalid` });

	const extname = require('path').extname(url.pathname);
	if (extname === '.js') {
		return new Resource({ content: config.code, extname });
	} else if (extname === '.json') {
		const content = JSON.stringify({ script: config.code });
		return new Resource({ content, extname });
	} else if (extname === '.ts') {
		await application.modules.self.ready;
		const path = p.join(application.modules.self.path, '/node_modules');
		const target = p.join(path, `/${project.specifier}/config.d.ts`);

		const content = config.declaration;
		await fs.save(target, content);
		return new Resource({ content, extname });
	}
};
