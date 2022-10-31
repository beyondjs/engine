const {fs} = global.utils;
const uglifier = new (require('./uglifier'));

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

        const p = require('path');
        const paths = this.#paths = {};
        paths.builds = p.join(builder.application.path, '.beyond/builds');
        paths.base = p.join(paths.builds, distribution.name);
        paths.build = p.join(paths.base, 'code');
        paths.archive = p.join(paths.base, 'build.zip');

        let www = '';
        const {platforms: {mobile}} = global;
        if (!distribution.npm) www = mobile.includes(distribution.platform) ? 'www' : '';
        else Object.keys(distribution.npm.platforms).forEach(platform => mobile.includes(platform) && (www = 'www'));
        paths.www = p.join(paths.build, www);
    }

    async validate() {
        const builder = this.#builder;
        const {builds} = builder;
        const paths = this.#paths;
        const distribution = this.#distribution;

        if (await fs.exists(paths.base)) {
            builder.emit('message', `A previous build was found on "${paths.base}"`);
            builder.emit('message', 'Removing all content of the previous build');
            await fs.promises.rmdir(paths.base, {recursive: true});
            builder.emit('message', 'Previous build removed');
        }
        else builder.emit('message', `Build is being processed on "${paths.base}"`);

        if (await fs.exists(paths.base)) {
            throw new Error(`Directory "${paths.base}" must be empty before building application`);
        }

        // Append the build data to the builds storage
        await builds.append(paths, distribution);

        // Create the target directory
        await fs.mkdir(paths.build, {'recursive': true});
    }

    async process() {
        const builder = this.#builder;
        const {builds} = builder;
        const distribution = this.#distribution;
        const {platform} = distribution;
        const {platforms} = global;
        const paths = this.#paths;

        console.log('--------', this.#specs)
        this.#specs.build && await this.validate();

        // Build modules
        const modules = new (require('./modules'));
        await modules.process(builder, distribution, paths.www, uglifier, this.#specs);

        if (!this.#specs.build) {
            builder.emit('message', `Process done`);
            return;
        }

        // Build platform specific resources, as icons, splash screen images and configuration files (config.xml)
        await (require('./resources'))(builder, distribution, paths.build);

        // Set project and modules static resources
        const staticEntries = {
            project: await (require('./statics'))(builder, distribution, paths.www),
            modules: modules.static
        };

        // Copy libraries statics resources
        await (require('./libraries'))(builder, distribution, paths.www);

        // Copy externals resources (node dependencies resources)
        const externals = await require('./externals')(builder, modules, distribution, paths);

        // Generate widgets static resources
        await require('./static.js')(builder, distribution, paths);

        // build index.html and start.js files
        await (require('./start'))(builder, distribution, paths.www, uglifier, modules.exported);

        // build config.js - only npm
        distribution.npm && await require('./config')(builder, distribution, paths.www, modules);

        // Save the package.json
        if (distribution.npm || platforms.node.includes(platform)) {
            await (require('./packages'))(modules, builder, paths, staticEntries, externals, distribution);
        }

        // Create the .zip file
        await require('./archive')(builder, paths.build, paths.archive);
        await require('./redirects')(distribution, paths.www);

        // Append the build data to the builds storage
        await builds.append(paths, distribution, true);

        builder.emit('message', `Build is done on "${paths.base}"`);
        builder.emit('message', `Process done`);
    }
}