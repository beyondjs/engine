const {ProcessorDeclaration} = require('beyond/sdk');
const InternalModules = require('./ims');
const Dependencies = require('./dependencies');
const build = require('./build');

module.exports = class extends ProcessorDeclaration {
    get dp() {
        return 'ts.declaration';
    }

    _build(diagnostics) {
        const {files} = this.compiler;

        /**
         * Create the ims
         * @type {Map<string, any>}
         */
        const ims = new InternalModules(files);
        const dependencies = new Dependencies();

        /**
         * Process the ims
         */
        ims.forEach(im => im.process(ims, dependencies));

        /**
         * Once all ims are processed and the dependencies are known, create the code of the declaration
         */
        return build(files, ims, dependencies, diagnostics);
    }
}
