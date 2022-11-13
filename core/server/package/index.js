const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');
const mformat = require('beyond/mformat');
const querystring = require('querystring');

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
    if (!js.outputs.valid) {
        const content = `Errors found processing bundle "${specifier.specifier}": ` + JSON.stringify(js.outputs.errors);
        return {content, statusCode: 500, contentType: 'text/plain'};
    }
    const resource = js.outputs.get();

    /**
     * Transform to the requested format if not esm
     */
    const qs = querystring.parse(url.search.slice(1));
    const format = qs.format ? qs.format : 'esm';
    const minify = qs.min !== void 0;

    if (!mformat.formats.includes(format)) {
        return {content: `Format "${format}" is not a valid option`, statusCode: 404, contentType: 'text/plain'};
    }

    const {code, map, errors} = mformat({format, minify, code: resource.code, map: resource.map});
    if (errors?.length) {
        const content = `Error transforming module to "${format}" format:` + JSON.stringify(errors);
        return {content, statusCode: 500, contentType: 'text/plain'};
    }

    return resource.valid ?
        {content: code, statusCode: 200, contentType: 'application/javascript'} :
        {content: 'Errors found processing resource', statusCode: 500, contentType: 'text/plain'};
}
