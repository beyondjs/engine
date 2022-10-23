const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');
const {CSpecs} = require('beyond/cspecs');

module.exports = async function (url) {
    const specifier = new SpecifierParser(url.pathname.slice(1));
    if (!specifier.pkg) return;
    if (!specifier.version) return {content: 'Package version must be set', contentType: 'text/plain', statusCode: 404};

    await packages.ready;
    await Promise.all([...packages.values()].map(pkg => pkg.ready));

    const vpkg = `${specifier.pkg}@${specifier.version}`;
    const pkg = packages.find({vspecifier: vpkg});
    if (!pkg) return;

    await pkg.exports.ready;
    const {bundle, error} = ((specifier) => {
        if (!pkg.exports.has(specifier)) return {error: `Bundle "${specifier}" not found`};

        const bundle = pkg.exports.get(specifier);
        return {bundle};
    })(specifier.specifier);
    if (error) return {content: error, contentType: 'text/plain', statusCode: 404};

    await bundle.ready;

    const cspecs = new CSpecs({platform: 'browser'});
    const packager = bundle.packagers.get(cspecs);
    await packager.js.ready;

    packager.js.valid ? console.log('Packager code:', packager.js.code()) : console.log(packager.js.errors);
}
