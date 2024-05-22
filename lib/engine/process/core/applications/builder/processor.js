const uglifier = new (require('./uglifier'))();

module.exports = class {
	#builder;
	#distribution;
	#specs;
	#paths;

	get paths() {
		return this.#paths;
	}

	constructor(builder, distribution, specs) {
		this.#builder = builder;
		this.#distribution = distribution;
		this.#specs = specs;
	}

	async process() {
		const builder = this.#builder;
		const { builds } = builder;
		const distribution = this.#distribution;
		const { platform } = distribution;
		const { platforms } = global;

		const paths = (this.#paths = await require('./paths')(builder, distribution));
		await require('./declarations')(builder, distribution, this.#specs.declarations);

		// Process modules
		const modules = new (require('./modules'))();
		await modules.process(builder, distribution, paths.www, uglifier, this.#specs);

		if (!this.#specs.build) {
			builder.emit('message', `Declaration process done`);
			return;
		}

		// Build platform specific resources, as icons, splash screen images and configuration files (config.xml)
		await require('./resources')(builder, distribution, paths.build);

		// Set project and modules static resources
		const staticEntries = {
			project: await require('./statics')(builder, distribution, paths.www),
			modules: modules.static,
		};

		// Copy libraries statics resources
		await require('./libraries')(builder, distribution, paths.www);

		// Copy externals resources (node dependencies resources)
		const externals = await require('./externals')(builder, modules, distribution, paths);

		// Generate widgets static resources
		await require('./static.js')(builder, distribution, paths);

		// build index.html and start.js files
		await require('./start')(builder, distribution, paths.www, uglifier, modules.exported);

		// build config.js - only npm
		await require('./config')(builder, distribution, paths.www, modules);

		// Save the package.json
		if (distribution.npm || platforms.node.includes(platform)) {
			await require('./json')(modules, builder, paths, staticEntries, externals, distribution);
		}

		// Save the redirect file
		await require('./redirects')(distribution, paths.www);

		// Create the .zip file
		await require('./archive')(builder, paths.build, paths.archive);

		// Append the build data to the builds storage
		await builds.append(paths, distribution, true);

		builder.emit('message', `Build is done on "${paths.base}"`);
		builder.emit('message', `Build process done`);
	}
};
