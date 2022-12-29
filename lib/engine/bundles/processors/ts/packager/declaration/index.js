const InternalModules = require('./ims');
const Dependencies = require('./dependencies');
const build = require('./build');

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

        return build(ims, dependencies, diagnostics);
    }
}
