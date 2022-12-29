const InternalModules = require('./ims');
const Dependencies = require('./dependencies');
const SourceMap = global.SourceMap;

module.exports = class extends global.ProcessorDeclaration {
    get dp() {
        return 'ts.declaration';
    }

    _build(diagnostics) {
        /**
         * Create the ims
         * @type {Map<string, any>}
         */
        const ims = new InternalModules(this.compiler.files);
        const dependencies = new Dependencies();

        /**
         * Process the ims
         */
        ims.forEach(im => im.process(ims, dependencies));

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
}
