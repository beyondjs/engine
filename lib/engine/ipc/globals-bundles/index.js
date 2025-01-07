const SDK = require('@beyond-js/bundles-sdk');
module.exports = class {
	//Legacy Bundles
	legacy = ['js', 'jsx', 'page', 'layout'];

	async get(ids) {
		await SDK.bundles.ready;

		const output = {};
		for (const id of ids) {
			if (!SDK.bundles.has(id)) continue;
			const bundle = SDK.bundles.get(id);
			output[bundle.name] = {
				id: bundle.name,
				name: bundle.name,
				processors: bundle.processors,
				multilanguage: bundle.multilanguage
			};
		}

		return output;
	}

	async list() {
		await SDK.bundles.ready;

		const output = {};
		SDK.bundles.forEach(bundle => {
			if (this.legacy.includes(bundle.name)) return;
			output[bundle.name] = {
				id: bundle.name,
				name: bundle.name,
				processors: bundle.processors,
				multilanguage: bundle.multilanguage
			};
		});

		return output;
	}
};
