/**
 * Process the processors scripts
 */
module.exports = function (conditional, sourcemap) {
    conditional.processors.forEach(processor => {
        if (!processor.js?.outputs.script) return;
        const {script} = processor.js.outputs;

        sourcemap.concat(script.code, void 0, script.map);
        sourcemap.concat('\n');
    });
}
