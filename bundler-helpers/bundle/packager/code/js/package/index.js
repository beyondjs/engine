const {minify} = require('uglify-js');
const mformat = require('beyond/mformat');

/**
 * Process the bundle code
 *
 * @param jscode {object} The js code packager
 * @param hmr {boolean} Is it an hmr bundle?
 * @param transversal {boolean} Is it a transversal package?
 */
module.exports = function (jscode, hmr, transversal) {
    'use strict';

    const {packager} = jscode;
    const {distribution} = packager;

    const sourcemap = require('./process')(jscode, hmr, transversal);
    if ((transversal && !hmr)) return {sourcemap};

    const {mode} = distribution.bundles;
    let {code, map, errors} = mformat({code: sourcemap.code, map: sourcemap.map, mode});
    if (errors) return {errors};

    if (!distribution.minify?.js) return {sourcemap: {code, map}};

    // Minify the .js bundle
    ({code, map} = minify(code, {sourceMap: {content: map}}));
    map = typeof map === 'string' ? JSON.parse(map) : map;
    return {sourcemap: {code, map}};
}
