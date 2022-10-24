const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');
const {CSpecs} = require('beyond/cspecs');

module.exports = async function (url) {
    const response = (content, statusCode) => ({content, statusCode, contentType: 'text/plain'});

    const specifier = new SpecifierParser(url.pathname.slice(1));
    if (!specifier.pkg) return;
    if (!specifier.version) return response('Package version must be set', 404);

    await packages.ready;
    await Promise.all([...packages.values()].map(pkg => pkg.ready));

    const vpkg = `${specifier.pkg}@${specifier.version}`;
    const pkg = packages.find({vspecifier: vpkg});
    if (!pkg) {
        const versions = packages.find({name: specifier.pkg});
        if (!versions.size) return;

        const values = JSON.stringify([...versions]);
        const content = `Package version is not registered.\nRegistered versions are: ${values}`;
        return response(content, 404);
    }

    await pkg.exports.ready;
    const {bundle, error} = (({specifier, pkg: name, version, subpath}) => {
        if (!pkg.exports.has(specifier)) {
            const exports = JSON.stringify([...pkg.exports.keys()]);
            const error = `Package "${name}@${version}" does not exports the subpath "${subpath}"\n\n` +
                `Registered subpaths are:\n${exports}`;
            return {error};
        }

        const bundle = pkg.exports.get(specifier);
        return {bundle};
    })(specifier);
    if (error) return response(error, 404);

    await bundle.ready;

    const cspecs = new CSpecs({platform: 'browser'});
    const packager = bundle.packagers.get(cspecs);
    await packager.js.ready;

    packager.js.valid ? console.log('Packager code:', packager.js.code()) : console.log(packager.js.errors);
}
