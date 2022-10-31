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
    // The resources being exported by the package
    #exported;
    get exported() {
        return this.#exported;
    }

    #externals;
    get externals() {
        return this.#externals;
    }

    #static;
    get static() {
        return this.#static;
    }

    async process(builder, distribution, path, uglifier, specs) {
        const exports = this.#exported = new Map();
        const externals = this.#externals = {
            all: new Set(),
            client: new Set()
        };

        let bridges = distribution.platform === 'backend' ? new (require('./bridges'))(path) : void 0;
        if (distribution.npm) {
            Object.keys(distribution.npm.platforms).forEach(platform =>
                platform === 'backend' && (bridges = new (require('./bridges'))(path))
            );
        }

        builder.emit('message', 'Processing application modules');

        const platforms = distribution.npm ? Object.keys(distribution.npm.platforms) : [distribution.platform];
        const {application} = builder;
        await application.modules.ready;

        for (const module of await application.modules.values()) {
            await module.ready;

            // Not to build @beyond-js/local as it is only required in local environment
            if (!distribution.npm && module.container.package === '@beyond-js/local') continue;
            if (!platforms.find(p => module.platforms.has(p))) continue;

            const id = application.package !== module.container.package ? module.specifier : module.subpath;
            builder.emit('message', `. Processing module "${id}"`);
            bridges && await bridges.process(module, distribution, builder);
            await require('./bundles')(builder, module, distribution, path, uglifier, exports, externals);
            const items = await require('./statics')(builder, module, path);
            this.#static = !this.#static ? items : Array.from(this.#static).concat(Array.from(items));
        }

        // build dependencies projects config.js
        await require('./config')(builder, distribution, path);

        // Save the bridges information
        await bridges?.save();
    }
}