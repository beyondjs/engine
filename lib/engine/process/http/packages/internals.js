module.exports = async function (core, route, res) {
    /**
     * Wait for all internal packages be ready
     */
    await core.packages.ready;
    const promises = [];
    core.packages.forEach(pkg => promises.push(pkg.ready));
    await Promise.all(promises);

    const {specifier, options} = route;
    const pkg = core.packages.find({vname: specifier.vpkg});
    if (!pkg) return;

    const {subpath} = specifier;
    const platform = options.platform === 'browser' ? 'web' : options.platform;
    await pkg.exports.ready;

    if (!pkg.exports.has(subpath)) {
        res.status(404).send(`Error: (404) - Subpath "${subpath}" not found`).end();
        return true;
    }
    if (!pkg.exports.get(subpath).has(platform)) {
        res.status(404).send(`Error: (404) - Platform "${platform}" is not configured on subpath "${subpath}"`).end();
        return true;
    }

    const contentType = (() => {
        if (options.map) return 'application/json';
        if (options.css) return 'text/css';
        return 'application/javascript';
    })();
    contentType && res.set('Content-Type', contentType);

    const code = await (async () => {
        // Targeted export
        const te = pkg.exports.get(subpath).get(platform);

        if (options.types) {
            if (options.map) return '';

            await te.types.ready;
            return te.types.code;
        }
        if (options.css) {
            await te.css.ready;
            return options.map ? te.css.map() : te.css.code();
        }
        else {
            await te.js.ready;
            return options.map ? te.js.map() : te.js.code();
        }
    })();
    res.send(code ? code : '').end();

    return true;
}
