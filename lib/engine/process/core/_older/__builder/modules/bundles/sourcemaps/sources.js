const p = require("path");
const {utils: {fs}} = global;
/**
 * Create bundle files only if the sourcemaps are requested as external
 * @param mode {string} sourcemap type
 * @param packager {object} bundle packager
 * @param processorName {object} processor name requested
 * @param path {string} where the files are generated
 */
module.exports = async function (mode, packager, processorName, path) {
    if (mode !== 'external') return;

    const processor = packager.processors.get(processorName);
    await processor.ready;

    const {files} = processor;
    await files.ready;

    const promises = [];
    files.forEach(source => promises.push(source.ready));
    await Promise.all(promises);

    const sourcePath = p.join(path, `sources`);
    files.size && await fs.mkdir(sourcePath, {'recursive': true});
    promises.size = 0;
    files.forEach(source => promises.push(fs.save(p.join(sourcePath, source.relative?.file), source.content)));
    await Promise.all(promises);
}