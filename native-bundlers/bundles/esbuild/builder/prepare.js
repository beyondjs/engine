const Registry = require('uimport/registry');
const DependenciesTree = require('uimport/dependencies-tree');
const Downloader = require('uimport/downloader');

module.exports = async function (building, specs) {
    // Generate the dependencies tree of the package to be built
    const tree = await (async () => {
        const registry = new Registry(specs.registry);

        const dependencies = new Map();
        dependencies.set(building.pkg, {version: building.version, kind: 'main'});

        const tree = new DependenciesTree(dependencies, registry);
        await tree.analyze();
        return tree;
    })();

    const {downloads, errors} = await (async () => {
        const downloads = new Map();
        const errors = [];

        for (const [vname, {vpackage}] of tree.list) {
            const downloader = new Downloader(vpackage, specs.downloader);
            try {
                await downloader.process();
            }
            catch (exc) {
                errors.push(`Error downloading package "${vname}": ${exc.message}`);
                continue;
            }

            downloads.set(vname, downloader);
        }

        return {errors, downloads};
    })();

    return {tree, downloads, errors};
}
