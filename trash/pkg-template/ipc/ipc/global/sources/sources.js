/**
 *
 * @param sources
 * @returns [{object}]
 */
module.exports = function (sources) {
    return [...sources.values()].map(source => ({
        id: source.id,
        code: source.content,
        file: source.file,
        filename: source.filename,
        dirname: source.dirname,
        basename: source.basename,
        extname: source.extname,
        relative: {file: source.relative?.file, dirname: source.relative?.dirname}
    }));
}