const {join, sep} = require("path");
const {utils: {fs}} = global;
/**
 * Set sourcemaps
 */
module.exports = async function (bundle, code, extname, path, mode, type, language) {
    const map = code.map();
    if (!map) return;

    const content = require('./content')(bundle, code.code(), map, extname, mode, type);
    if (mode !== 'external') return content;

    // TODO - v1, we don't handle sourcemap for txt bundles in this version
    const mapContent = JSON.parse(JSON.stringify(map));
    // TODO p1 - commented solution until esbuild issue with sourceRoot is resolved
    // mapContent.sourceRoot = join('__sources', bundle.subpath);
    // mapContent.sourcesContent && delete mapContent.sourcesContent;
    // TODO p2 - temporary solution
    mapContent.sources = mapContent.sources.map(source => {
        source = join('__sources', bundle.subpath, source);
        return sep === '/' ? source : source.replace(/\\/g, '/');
    });

    const target = join(path, `${bundle.subpath}${language ? `.${language}` : ''}.${type ? type : extname}.map`);
    await fs.save(target, JSON.stringify(mapContent));

    return content;
}