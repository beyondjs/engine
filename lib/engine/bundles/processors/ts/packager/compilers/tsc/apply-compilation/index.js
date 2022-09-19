module.exports = function (compiler, sources, updated, diagnostics, emitted, diagnosed) {
    const {processor} = compiler.packager;

    require('./diagnostics')(processor, sources, diagnostics, diagnosed);
    require('./files')(compiler, sources, updated, emitted, diagnostics);
}
