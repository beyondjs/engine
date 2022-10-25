module.exports = function (processor, sourcemap) {
    const {packager} = processor;
    if (!packager || !packager.js) return;

    let {code} = processor.packager.js;
    if (!code) return;

    code = typeof code === 'string' ? {code: code} : code;
    if (!code.code) return;

    sourcemap.concat(code.code, void 0, code.map);
    sourcemap.concat('\n');
}
