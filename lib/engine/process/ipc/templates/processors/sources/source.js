/**
 *
 * @param item
 * @param processorName
 * @returns {object}
 */
module.exports = function (item, processorName) {
    return {
        id: item.id,
        processor: processorName,
        code: item.content,
        file: item.file,
        filename: item.filename,
        dirname: item.dirname,
        basename: item.basename,
        extname: item.extname,
        errors: [],
        warnings: [],
        relative: {file: item.relative.file, dirname: item.relative.dirname}
    }
}