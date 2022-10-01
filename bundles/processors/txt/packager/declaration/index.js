const ts = require('typescript');

module.exports = class extends global.ProcessorDeclaration {
    get dp() {
        return 'txt.declaration';
    }

    _build(diagnostics) {
        let code = (() => {
            const builder = this.children.get('code').child;

            // The IM (internal module) with the txt code
            const {code} = [...builder.ims.values()][0];
            return code ? code : '';
        })();

        const options = {
            allowJs: true,
            declaration: true,
            emitDeclarationOnly: true,
            types: [],
            skipLibCheck: true,
            noLib: true
        };

        let output;
        try {
            const host = ts.createCompilerHost(options);
            const {getSourceFile} = host;
            host.getSourceFile = (file, lv, error) => {
                if (file === 'source.js') {
                    // The texts source file content
                    return ts.createSourceFile(file, code, lv)
                }
                else {
                    // The typescript required files
                    return getSourceFile(file, lv, error);
                }
            }
            host.writeFile = (file, content) => file === 'source.d.ts' && (output = content);

            const program = ts.createProgram(['source.js'], options, host);
            program.emit();
        }
        catch (exc) {
            diagnostics.general.push(exc.message);
            return;
        }

        return output;
    }
}
