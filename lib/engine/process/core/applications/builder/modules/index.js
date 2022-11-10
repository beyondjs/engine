const {platforms: {node}} = global;

/**
 * Build application modules
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @param processSpecs {compile: boolean, declarations: boolean} Process specs client
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

    async process(builder, distribution, path, uglifier, processSpecs) {
        const exports = this.#exported = new Map();
        const externals = this.#externals = {
            all: new Set(),
            client: new Set()
        };

        const {npm, platform} = distribution;

        let bridges = platform === 'backend' ? new (require('./bridges'))(path) : void 0;
        npm && Object.keys(npm.platforms).forEach(p => p === 'backend' && (bridges = new (require('./bridges'))(path)));

        builder.emit('message', 'Processing application modules');

        const platforms = npm ? Object.keys(npm.platforms) : [platform];
        const {application} = builder;
        await application.modules.ready;

        for (const module of await application.modules.values()) {
            await module.ready;

            // Not to build @beyond-js/local as it is only required in local environment
            if (!npm && module.container.package === '@beyond-js/local') continue;
            if (!platforms.find(p => module.platforms.has(p))) continue;

            //bundles are not generated when compiled with node distribution and the module is a package from another project
            if (application.package !== module.container.package && (npm || node.includes(platform))) {
                continue;
            }

            const id = application.package !== module.container.package ? module.specifier : module.subpath;
            builder.emit('message', `. Processing module "${id}"`);
            bridges && await bridges.process(module, distribution, builder);

            await require('./bundles')({
                builder, module, distribution, path, uglifier, exports, externals, processSpecs
            });

            if (!processSpecs.build) continue;
            const items = await require('./statics')(builder, module, path);
            this.#static = !this.#static ? items : Array.from(this.#static).concat(Array.from(items));
        }

        // build dependencies projects config.js
        await require('./config')(builder, distribution, path);

        // Save the bridges information
        await bridges?.save();
    }
}