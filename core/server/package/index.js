const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');

module.exports = async function (url) {
    const specifier = new SpecifierParser(url.pathname.slice(1));
    if (!specifier.pkg) return;
    if (!specifier.version) {
        return {content: 'Package version must be set', statusCode: 404, contentType: 'text/plain'};
    }

    await packages.ready;
    await Promise.all([...packages.values()].map(pkg => pkg.ready));

    const vpkg = `${specifier.pkg}@${specifier.version}`;
    const pkg = packages.find({vspecifier: vpkg});
    if (!pkg) {
        const versions = packages.find({name: specifier.pkg});
        if (!versions.size) return;

        const values = JSON.stringify([...versions]);
        const content = `Package version is not registered.\nRegistered versions are: ${values}`;
        return {content, statusCode: 404, contentType: 'text/plain'};
    }

    await pkg.exports.ready;
    const {pexport, error} = (({pkg: name, version, subpath}) => {
        if (!pkg.exports.has(subpath)) {
            const exports = JSON.stringify([...pkg.exports.keys()]);
            const error = `Package "${name}@${version}" does not export subpath "${subpath}"\n\n` +
                `Registered subpaths are:\n${exports}`;
            return {error};
        }

        const pexport = pkg.exports.get(subpath);
        return {pexport};
    })(specifier);
    if (error) return {content: error, statusCode: 404, contentType: 'text/plain'};

    /**
     * Standard exports are dynamic processors, while exports from modules aren't
     */
    pexport.is === 'standard' && await pexport.ready;

    const condition = pexport.condition('browser');
    const {js} = condition;

    await js.outputs.ready;
    const resource = js.outputs.get();

    return resource.valid ?
        {content: resource.code, statusCode: 200, contentType: 'application/javascript'} :
        {content: 'Errors found processing resource', statusCode: 500, contentType: 'text/plain'};
}
