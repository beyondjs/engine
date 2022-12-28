const InternalModule = require('./im');
const SourceMap = global.SourceMap;

module.exports = class extends global.ProcessorDeclaration {
    get dp() {
        return 'ts.declaration';
    }

    _build(diagnostics) {
        const sourcemap = new SourceMap();
        let index = 0;
        this.compiler.files.forEach(({declaration, declarationMap}, file) => {
            const id = `ns_${index++}`;
            const im = new InternalModule(id, file, declaration, declarationMap);
            if (!im.valid) {
                diagnostics.files.set(file, [im.error]);
                return;
            }

            sourcemap.concat(`// ${file}`);
            sourcemap.concat(im.code, null, im.map);
            sourcemap.concat('\n');
        });

        return sourcemap.code;
    }
}
