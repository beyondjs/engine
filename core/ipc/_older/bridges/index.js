const {PathnameParser} = global;
const {ipc} = global.utils;

module.exports = class {
    #model;

    // Cache of application ids from application paths to avoid duplicated IPC calls
    #ids = new Map();

    constructor(model) {
        this.#model = model;
    }

    async get(application, resource, distribution) {
        if (typeof application !== 'number') throw new Error('Invalid parameters');

        const ids = this.#ids;
        const path = ids.has(application) ? ids.get(application) : await ipc.exec('main', 'ids.path/get', application);
        ids.set(application, path);
        if (!path) throw new Error(`Path of application ${application} not found`);

        // Getting the application object
        const {applications} = this.#model.core;
        await applications.ready;
        if (!applications.has(path)) throw new Error(`Application "${path}" - "${application}" not found`);
        application = applications.get(path);
        await application.ready;

        const pathname = (() => {
            // Check if it is an application package,
            // where the pathname does not include the /packages folder
            const pkg = application.package;
            const appPackage = resource === pkg || resource.startsWith(`${pkg}/`);
            if (appPackage) return `${resource.substr(pkg.length)}.js`;

            // Any other bundle must be in the /packages folder
            return `/packages/${resource}/bridge.js`;
        })();

        const parsed = new PathnameParser(application, pathname);
        await parsed.process(distribution);
        const {valid, error, found, is, bundle} = parsed;

        if (!valid) return {error};
        if (!found) return {error: `Bundle "${pathname}" not found`};

        if (is !== 'bundle') return {error: `Bundle "${bundle}" is invalid`};
        const classes = await require('./bridge')(bundle, distribution);
        return {classes};
    }
}
