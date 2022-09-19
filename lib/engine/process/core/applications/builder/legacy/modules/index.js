/**
 * Build application modules
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */

module.exports = class {
    #externals;
    get externals() {
        return this.#externals;
    }

    async process(builder, distribution, path, uglifier) {
        builder.emit('message', 'Building application modules');

        const externals = this.#externals = {
            all: new Set(),
            client: new Set()
        };
        const {application} = builder;
        await application.modules.ready;
        for (const module of await application.modules.values()) {
            await module.ready;

            if (module.container.is === 'library' && module.container.name === 'beyond-local') continue;

            const modulePlatforms = [...module.platforms.keys()];
            if (!modulePlatforms.includes(distribution.platform)) continue;

            builder.emit('message', `. Building module "${module.pathname}"`);
            await require('./bundles.js')(builder, module, distribution, path, uglifier, externals);
            await require('./statics.js')(builder, module, path);
        }
    }
}