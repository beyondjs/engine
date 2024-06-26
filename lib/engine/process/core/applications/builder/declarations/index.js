const p = require('path');
const { fs } = global.utils;

module.exports = async function (builder, distribution, declarations) {
	if (!declarations) return;

	const {
		application: {
			modules: { self },
			config,
			specifier,
		},
	} = builder;
	const path = p.join(self.path, '/node_modules');

	await fs.save(p.join(path, '/beyond_context/index.ts'), require('./beyond-context'));

	const conf = config.get(distribution);
	await conf.ready;
	const target = p.join(path, `/${specifier}/config/index.ts`);
	await fs.save(target, conf.declaration);
};
