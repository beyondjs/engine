const {Resource} = global;

module.exports = async function (application) {
    const {package: specifier, version, path} = application;
    const vspecifier = `${specifier}@${version}`;

    await application.libraries.ready;
    const libraries = [...application.libraries.keys()];

    const {bundles} = global;
    await bundles.ready;
    const transversals = [...bundles.transversals.keys()];

    const content = JSON.stringify({
        path, vspecifier, specifier, version, libraries, transversals
    });

    return new Resource({content, extname: '.json'});
}
