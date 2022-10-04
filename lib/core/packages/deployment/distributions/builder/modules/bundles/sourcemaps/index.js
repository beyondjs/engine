const p = require('path');
const fs = require('beyond/utils/fs');

/**
 * Set sourcemaps
 */
module.exports = async function (bundle, code, extname, path, mode, type) {
    const map = code.map();
    const content = require('./content')(bundle, code.code(), map, extname, mode, type);
    if (mode !== 'external') return content;

    const target = p.join(path, `${bundle.subpath}.${type ? type : extname}.map`);
    await fs.save(target, JSON.stringify(map));

    return content;
}
