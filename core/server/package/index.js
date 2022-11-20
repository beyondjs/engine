const packages = require('beyond/packages');
const SpecifierParser = require('beyond/utils/specifier-parser');
const processJs = require('./js');
const processTypes = require('./types');

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
    const {packageExport, error} = (({pkg: name, version, subpath}) => {
        if (!pkg.exports.has(subpath)) {
            const exports = JSON.stringify([...pkg.exports.keys()]);
            const error = `Package "${name}@${version}" does not export subpath "${subpath}"\n\n` +
                `Registered subpaths are:\n${exports}`;
            return {error};
        }

        const packageExport = pkg.exports.get(subpath);
        return {packageExport};
    })(specifier);
    if (error) return {content: error, statusCode: 404, contentType: 'text/plain'};

    /**
     * Standard exports are dynamic processors, while exports from modules aren't
     */
    packageExport.is === 'standard' && await packageExport.ready;

    const qs = url.searchParams;
    const platform = qs.get('platform');
    if (!platform) return {content: 'Platform must be specified', statusCode: 404, contentType: 'text/plain'};

    const targetedExport = packageExport.getTargetedExport(platform);
    if (!targetedExport) return {
        content: `Platform "${platform}" is not supported by "${specifier}" module`,
        statusCode: 404,
        contentType: 'text/plain'
    };

    const types = qs.has('types');
    if (types) return await processTypes(specifier, targetedExport);

    const local = qs.has('hmr') ? {hmr: qs.get('hmr')} : {};
    const format = qs.has('format') ? qs.get('format') : 'esm';
    const minify = qs.has('min');
    const map = qs.has('map');
    return await processJs(specifier, targetedExport, local, {format, minify, map});
}
