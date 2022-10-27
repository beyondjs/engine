module.exports = async function (specs, compiler, sourcemap) {
    const transversal = !!global.bundles.get(specs.bundle.name).Transversal;
    const processor = transversal ? './transversal' : './bundle';

    await require(processor)(specs, compiler, sourcemap);
}
