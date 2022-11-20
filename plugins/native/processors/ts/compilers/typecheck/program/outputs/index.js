module.exports = class extends Map {
    constructor(compiler, diagnostics, emitted) {
        super();
        console.log('typescript output:', diagnostics, emitted);
    }
}
