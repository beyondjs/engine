const toHtml = new (require('ansi-to-html'));

// Convert from ES6 module to AMD, CJS, SystemJS
module.exports = function (specs) {
    'use strict';

    const {code, map, mode} = specs;

    if (!['amd', 'esm', 'cjs', 'sjs'].includes(mode)) {
        throw new Error('Invalid parameters');
    }

    if (mode === 'esm') return {code, map};
    const plugin = mode === 'amd' ?
        '@babel/plugin-transform-modules-amd' :
        (mode === 'cjs' ? '@babel/plugin-transform-modules-commonjs' :
            '@babel/plugin-transform-modules-systemjs');

    let output;
    try {
        output = require('@babel/core').transform(code, {
            cwd: __dirname,
            sourceMaps: !!map,
            inputSourceMap: map,
            compact: false,
            plugins: [[plugin, {importInterop: 'none'}]]
        });
    }
    catch (exc) {
        let message = toHtml.toHtml(exc.message);
        message = message.replace(/\n/g, '<br/>');
        message = `<div style="background: #333; color: white;">${message}</div>`;
        message = `Error transforming to ${mode} module: <br/><br/>${message}`;
        return {errors: [message]};
    }

    return {code: output.code, map: output.map === null ? void 0 : output.map};
}
