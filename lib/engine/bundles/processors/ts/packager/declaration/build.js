const SourceMap = global.SourceMap;

module.exports = function (files, ims, dependencies, diagnostics) {
    const sourcemap = new SourceMap();

    /**
     * Process the imports
     */
    dependencies.elements.forEach(({ns, def}, specifier) => {
        ns.consumers.size && sourcemap.concat(`import * as ${ns.name} from '${specifier}';`);
        def.consumers.size && sourcemap.concat(`import ${def.name} from '${specifier}';`);
    });

    /**
     * Process the declaration code of each internal module
     */
    ims.forEach(im => {
        if (!im.valid) {
            diagnostics.files.set(im.filename, [im.error]);
            return;
        }

        sourcemap.concat(`// ${im.filename}`);
        sourcemap.concat(im.code, null, im.map);
        sourcemap.concat('\n');
    });

    /**
     * Process the exports of the bundle
     */
    files.forEach(({exports}, filename) => exports.forEach(exported => {
        let {name, from} = exported;
        const {id: ns} = ims.get(filename);

        sourcemap.concat(name !== 'default' ?
            `export import ${name} = ${ns}.${from};` :
            `export default ${ns}._default;`);
    }));

    return sourcemap.code;
}
