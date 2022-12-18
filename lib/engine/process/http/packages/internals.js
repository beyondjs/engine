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

    await pkg.exports.ready;

    const key = `${specifier.pkg}//${options.platform}`;
    console.log(key, [...pkg.exports.keys()]);
}
