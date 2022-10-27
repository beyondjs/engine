module.exports = function (processor, sourcemap) {
    const {packager} = processor;
    if (!packager?.js) return;

    const {ims} = packager.js
    ims?.forEach(im => require('./im')(im, sourcemap))
}
