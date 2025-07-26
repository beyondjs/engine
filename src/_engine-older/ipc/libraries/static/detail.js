/**
 *
 * @param id
 * @param item
 * @returns {object}
 */
module.exports = function (id, item) {
    return {
        id: `${id}//${item.filename}`,
        file: item.file,
        filename: item.filename,
        dirname: item.dirname,
        basename: item.basename,
        extname: item.extname,
        pathname: `${item.relative?.dirname}\\static\\${item.relative?.file}`,
        relative: {file: item.relative?.file, dirname: item.relative?.dirname}
    };
}