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

    /**
     * TODO - temporary solution
     *  The sourceRoot entry is not defined for the files that are consumed from node,
     *  since the execution environment takes care of resolving it through the physical path.
     *  For the rest of the files we define "/" since the location of the file depends
     *  on the logical path from where it is requested.
     */
    mapContent.sourceRoot = '/';
    if (['cjs.js', 'mjs'].includes(type)) delete mapContent.sourceRoot;
    mapContent.sources = mapContent.sources.map(source => {
        source = join('__sources', bundle.subpath, source);
        return sep === '/' ? source : source.replace(/\\/g, '/');
    });

    const target = join(path, `${bundle.subpath}${language ? `.${language}` : ''}.${type ? type : extname}.map`);
    await fs.save(target, JSON.stringify(mapContent));

    return content;
}