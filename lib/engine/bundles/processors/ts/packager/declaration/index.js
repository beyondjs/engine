module.exports = class extends global.ProcessorDeclaration {
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
