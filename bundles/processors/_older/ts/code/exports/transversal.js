/**
 * The exports declaration when the processor is in a transversal bundle
 *
 * @param specs {object}
 * @param compiler {object} The compiler
 * @param sourcemap {object} The sourcemap
 * @return {Promise<void>}
 */
module.exports = async function (specs, compiler, sourcemap) {
    compiler.files.forEach(compiled => {
        const module = require('../modules/id')(compiled);
        compiled.exports.forEach(exported =>
            sourcemap.concat(`exports.${exported} = bundle.require.solve('${module}').${exported};`)
        );
    });
}
