const SourceMap = global.SourceMap;

module.exports = function (ims, dependencies, diagnostics) {
    console.log('CONTINUE WITH:');
    console.log('1. The imports of the bundle');
    console.log('2. The exports of the bundle');
    console.log('3. Save declaration');

    /**
     * Once all ims are processed and the dependencies are known, create the code of the declaration
     */
    const sourcemap = new SourceMap();
    ims.forEach(im => {
        if (!im.valid) {
            diagnostics.files.set(im.filename, [im.error]);
            return;
        }

        sourcemap.concat(`// ${im.filename}`);
        sourcemap.concat(im.code, null, im.map);
        sourcemap.concat('\n');
    });
    return sourcemap.code;
}
