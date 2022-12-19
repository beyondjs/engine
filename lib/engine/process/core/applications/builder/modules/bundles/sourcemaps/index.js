const p = require('path');
const {utils: {fs}} = global;
/**
 * Set sourcemaps
 */
module.exports = async function (bundle, code, extname, path, mode, type, language) {
    const map = code.map();
    if (!map) return;

    const content = require('./content')(bundle, code.code(), map, extname, mode, type);
    if (mode !== 'external') return content;

    // TODO txt, V1 no manejamos sourcemaps para los txt
    const mapContent = JSON.parse(JSON.stringify(map));
    mapContent.sourceRoot = p.join('__sources', bundle.subpath);
    mapContent.sourcesContent && delete mapContent.sourcesContent;

    const target = p.join(path, `${bundle.subpath}${language ? `.${language}` : ''}.${type ? type : extname}.map`);
    await fs.save(target, JSON.stringify(mapContent));

    return content;
}