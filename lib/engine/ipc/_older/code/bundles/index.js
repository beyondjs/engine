const {PathnameParser} = global;

module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(applicationId, resources, distribution) {
        if (!distribution.local) throw new Error('Distribution is invalid, .local property should be true');

        // The imports must be a Map and it is received as an array of entries to be able to be serialized through IPC
        distribution.imports = new Map(distribution.imports);

        resources = typeof resources === 'string' ? [resources] : resources;
        if (!(resources instanceof Array)) throw new Error('Invalid parameters');

        const application = await require('../application')(this.#model.core, applicationId);
        await application.transversals.ready;

        const promises = new Map();
        const process = async resource => {
            const {pathname, querystring} = (() => {
                let querystring;
                [resource, querystring] = resource.split('?');

                const done = pathname => ({pathname, querystring});

                // Check if resource is a transversal,
                // in which case, the pathname is just the name of the traversal
                if (application.transversals.has(resource)) return done(`/${resource}.js`);

                // Check if it is an application package,
                // where the pathname does not include the /packages folder
                const pkg = application.package;
                const appPackage = resource === pkg || resource.startsWith(`${pkg}/`);
                if (appPackage) return done(`${resource.substr(pkg.length)}.js`);

                // Any other bundle must be in the /packages folder
                return done(`/packages/${resource}.js`);
            })();

            const parsed = new PathnameParser(application, pathname, querystring);
            await parsed.process(distribution);
            const {valid, error, found, is, bundle} = parsed;
            if (!valid) return {errors: [error]};
            if (!found) return {errors: [`Bundle "${pathname}" not found`]};

            try {
                return await require('./bundle')(is, bundle, distribution, parsed);
            }
            catch (exc) {
                console.error('Error getting bundle code', exc.stack);
            }
        }
        resources.forEach(resource => promises.set(resource, process(resource)));

        try {
            await Promise.all([...promises.values()]);
        }
        catch (exc) {
            console.error(exc.stack);
            return [];
        }

        const output = new Map();
        for (const [id, bundle] of promises) {
            output.set(id, await bundle);
        }

        return [...output];
    }
}
