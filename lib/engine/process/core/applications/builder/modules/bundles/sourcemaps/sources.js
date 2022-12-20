const p = require("path");
const {utils: {fs}} = global;
/**
 * Create bundle files only if the sourcemaps are requested as external
 * @param mode {string} sourcemap type
 * @param packager {object} bundle packager
 * @param processorName {string} processor name requested
 * @param path {string} where the files are generated
 * @param builder
 * @param language
 */
module.exports = async function (mode, packager, processorName, path, builder, language) {
    if (mode !== 'external') return;

    const processor = packager.processors.get(processorName);
    if (!processor) {
        builder.emit('error', `  . 
        Error building sourcemap for processor "${processorName}", module:${packager.bundle.container.specifier}`
        );
        return;
    }
    await processor.ready;

    const {files} = processor;
    await files.ready;

    const promises = [];
    files.forEach(source => promises.push(source.ready));
    await Promise.all(promises);

    const sourcePath = p.join(path, `__sources`);
    files.size && await fs.mkdir(sourcePath, {'recursive': true});
    promises.size = 0;

    files.forEach(source => {
        const path = p.relative(packager.bundle.path, source.file);
        if (path.startsWith('..')) return;

        promises.push(fs.save(p.join(sourcePath, packager.bundle.subpath, `${language ? `.${language}` : ''}`, path), source.content))
    });
    await Promise.all(promises);
}