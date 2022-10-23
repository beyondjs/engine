const toHtml = new (require('ansi-to-html'));
const {minify} = require('uglify-js');

/**
 * Transform from esm to sjs and/or minify code
 *
 * @param specs {{code: string, map: *, format: 'sjs' | 'amd' | 'cjs' | 'esm' | undefined, minify: boolean}}
 * @return {{code, map, errors}}
 */
module.exports = function (specs) {
    'use strict';

    specs.format = !specs.format ? 'esm' : specs.format;

    if (!specs.code) throw new Error('Code specification is not defined');
    if (!['amd', 'esm', 'cjs', 'sjs'].includes(specs.format)) throw new Error('Invalid parameters');

    let {code, map, errors} = (() => {
        const {code, map} = specs;
        if (specs.format === 'esm') return {code, map};

        const plugin = specs.format === 'amd' ?
            '@babel/plugin-transform-modules-amd' :
            (specs.format === 'cjs' ? '@babel/plugin-transform-modules-commonjs' :
                '@babel/plugin-transform-modules-systemjs');

        let transform;
        try {
            transform = require('@babel/core').transform(code, {
                cwd: __dirname,
                sourceMaps: !!map,
                inputSourceMap: map,
                compact: false,
                plugins: [[plugin, {importInterop: 'none'}]]
            });
            return {code: transform.code, map: transform.map ? transform.map : void 0};
        }
        catch (exc) {
            let message = toHtml.toHtml(exc.message);
            message = message.replace(/\n/g, '<br/>');
            message = `<div style="background: #333; color: white;">${message}</div>`;
            message = `Error transforming to ${specs.format} module: <br/><br/>${message}`;
            return {errors: [message]};
        }
    })();
    if (errors) return {errors};

    if (!specs.minify) return {code, map};

    try {
        const minified = minify(code, {sourceMap: {content: map}});
        return {code: minified.code, map: minified.map ? minified.map : void 0}
    }
    catch (exc) {
        return {errors: [exc.message]};
    }
}