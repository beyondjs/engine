const SpecifierParser = require('beyond/utils/specifier-parser');

module.exports = async function (url, packages) {
    const specifier = new SpecifierParser(url.pathname.slice(1));
    if (!specifier.pkg) return;
    if (!specifier.version) return {content: 'Package version must be set', contentType: 'text/plain', statusCode: 404};

    await packages.ready;
    await Promise.all([...packages.values()].map(pkg => pkg.ready));

    const vpkg = `${specifier.pkg}@${specifier.version}`;
    if (!packages.has(vpkg)) return;

    const pkg = packages.get(vpkg);
    await pkg.modules.ready;
    const vspecifier = vpkg + (specifier.subpath ? `/${specifier.subpath}` : '');

    await Promise.all([...pkg.modules.values()].map(module => module.ready));
    const module = pkg.modules.find({vspecifier});
    await module.ready;
    await module.bundles.ready;
    if (!module.bundles.size) return;

    const {bundle, error} = await (async () => {
        const {bundles} = module;
        const {type, error} = await (async () => {
            if (specifier.bundle) return {type: specifier.bundle};
            if (bundles.size > 1) return {error: 'Bundle type must be specified in a multibundle module'};

            return {type: [...bundles.keys()][0]};
        })();
        if (error) return {error};

        if (!bundles.has(type)) {
            const types = JSON.stringify([...bundles.keys()]);
            return {error: `Bundle type "${type}" is invalid. Bundles currently specified in the module are: ${types}`};
        }
        return {bundle: bundles.get(type)};
    })();
    if (error) return {content: error, contentType: 'text/plain', statusCode: 404};

    await bundle.ready;
    console.log('Bundle found:', !!bundle);
}
