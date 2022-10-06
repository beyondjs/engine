const {ProcessorDeclaration} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorDeclaration {
    get dp() {
        return 'ts.declaration';
    }

    _build(diagnostics) {
        void (diagnostics);
        let code = '';

        const compiler = this.compiler;
        code += require('./modules')(compiler);
        code += require('./exports')(compiler);

        return code;
    }
}
