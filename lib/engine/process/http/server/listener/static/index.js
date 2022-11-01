/**
 * Serves the static files of the application, the libraries and the modules
 *
 * @param application {object} The application object
 * @param distribution {object} The distribution specification
 * @param url {object} The parsed url being served
 * @return {Promise<void>}
 */
module.exports = async function (application, distribution, url) {
    const pathname = url.pathname.slice(1);

    let resource;
    resource = await require('./application')(application, url);
    if (resource) return resource;

    const {pkg, version, subpath} = (() => {
        const split = pathname.split('/');
        if (split[0] !== 'packages') return {pkg: application.package, subpath: pathname};
        split.shift(); // Remove the 'packages' entry

        const scope = split[0].startsWith('@') ? split.shift() : '';
        const {name, version} = (() => {
            let [name, version] = split.shift().split('@');
            name = scope + (scope ? `/` : '') + name;
            return {name, version};
        })();
        const subpath = split.join('/');

        return {pkg: name, version, subpath};
    })();
    void version;

    const original = url.searchParams.has('original');

    // Check if it is a static of a library
    if (pkg !== application.package) {
        await application.libraries.ready;

        // If it is not an application library, it can still be a static of an external package
        if (!application.libraries.has(pkg)) return;
        const library = application.libraries.get(pkg);

        await library.static.ready;
        if (library.static.has(subpath)) {
            const resource = library.static.get(subpath);
            return new Resource({file: resource.overwrite && !original ? resource.overwrite.file : resource.file.file});
        }
    }

    // Check if the resource is a static of a module
    // by recursively searching for the module that contains the resource
    await application.modules.ready;
    const recursivelyFindModule = (iterate, subpath) => {
        if (!iterate.length) return;

        const id = `${pkg}/${iterate.join('/')}`;
        if (application.modules.specifiers.has(id)) {
            // The module was found
            const module = application.modules.platforms.get(`${id}//${distribution.platform}`);
            return {module, subpath};
        }

        // Module not found, keep iterating
        subpath = `${iterate.pop()}/${subpath}`;
        return recursivelyFindModule(iterate, subpath);
    }

    const iterate = subpath.split('/');
    const filename = iterate.pop();
    const found = recursivelyFindModule(iterate, filename);
    if (!found) return;

    await found.module.static.ready;
    if (!found.module.static.has(found.subpath)) return;

    const asset = found.module.static.get(found.subpath);
    return new Resource({file: asset.overwrite && !original ? asset.overwrite.file : asset.file.file});
}
