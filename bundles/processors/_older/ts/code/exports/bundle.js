/**
 * The exports declaration when the processor is in a bundle that is not the 'start' bundle
 *
 * @param specs {object}
 * @param compiler {object} The compiler
 * @param sourcemap {object} The sourcemap
 * @return {Promise<void>}
 */
module.exports = async function (specs, compiler, sourcemap) {
    if (!compiler.files.size) return;

    // Add the declaration of all exports
    let declaration = [];
    compiler.files.forEach(compiled =>
        compiled.exports.forEach(exported => declaration = declaration.concat(exported)));

    // Declare the exports
    declaration.length && sourcemap.concat(`export let ${declaration.join(', ')};\n`);

    const core = specs.bundle.resource === '@beyond-js/kernel/core';
    const hydrator = specs.bundle.resource === '@beyond-js/ssr/hydrator';

    const tab = !core && !hydrator ? '    ' : '';
    const values = (() => {
        let output = '';
        const rq = core || hydrator ? 'bundle.require' : 'require';

        // Iterate over each compiled file
        compiler.files.forEach(compiled => {
            let module = require('../modules/id')(compiled);
            module = module.startsWith('./beyond_backend/') ? module.substr(2) : module;

            // Iterate over the exports of each file
            compiled.exports.forEach(
                exported => (output += `${tab}${exported} = ${rq}('${module}').${exported};\n`));
        });
        return output;
    })();

    !core && !hydrator && sourcemap.concat('bundle.exports.process = function(require) {');
    sourcemap.concat(values);
    !core && !hydrator && sourcemap.concat('};');
}
