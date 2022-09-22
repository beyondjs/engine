const {fs} = global.utils;
const uglifier = new (require('./uglifier'));

module.exports = class {
    #builder;
    #distribution;
    #paths;
    get paths() {
        return this.#paths;
    }

    constructor(builder, distribution) {
        this.#builder = builder;
        this.#distribution = distribution;

        const p = require('path');
        const paths = this.#paths = {};
        paths.builds = p.join(process.cwd(), '.beyond/builds/client');
        paths.base = p.join(paths.builds, distribution.name);
        paths.build = p.join(paths.base, 'code');
        paths.www = p.join(paths.build, ['android', 'ios'].includes(distribution.platform) ? 'www' : '');
        paths.archive = p.join(paths.base, 'build.zip');
    }

    async process() {
        const builder = this.#builder;
        const {builds} = builder;
        const distribution = this.#distribution;
        const paths = this.#paths;

        if (await fs.exists(paths.base)) {
            builder.emit('message', `A previous build was found on "${paths.base}"`);
            builder.emit('message', 'Removing all content of the previous build');
            await fs.promises.rmdir(paths.base, {recursive: true});
            builder.emit('message', 'Previous build removed');
        }
        else {
            builder.emit('message', `Build is being processed on "${paths.base}"`);
        }
        if (await fs.exists(paths.base)) {
            throw new Error(`Directory "${paths.base}" must be empty before building application`);
        }

        // Append the build data to the builds storage
        await builds.append(paths, distribution);

        // Create the target directory
        await fs.promises.mkdir(paths.build, {'recursive': true});

        // Build mode specific resources, as icons, splash, configuration files
        await (require('./resources'))(builder, distribution, paths.build);

        // build index.html, config.js and start.js files
        await (require('./start'))(builder, distribution, paths.www, uglifier);

        // Copy static resources
        await (require('./statics'))(builder, distribution, paths.www);

        // Copy libraries statics resources
        await (require('./libraries'))(builder, distribution, paths.www);

        // Build modules
        // await (require('./modules'))(builder, distribution, paths.www, uglifier);
        const modules = new (require('./modules'));
        await modules.process(builder, distribution, paths.www, uglifier);

        // Copy externals resources (node dependencies resources)
        // await (require('./externals'))(builder, modules, paths,distribution);
        await require('./externals')(builder, modules, distribution, paths);

        // Create the .zip file
        await require('./archive.js')(builder, paths.build, paths.archive);

        // Append the build data to the builds storage
        await builds.append(paths, distribution, true);
    }
}
