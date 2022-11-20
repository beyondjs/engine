const cache = new Map();

module.exports = async function (specifier, targetedExport, local, specs) {
    const cacheKey = (() => {
        const {minify, map} = specs;
        return `${targetedExport.id}//` + (map ? 'map//' : 'code//') + (minify ? 'minify' : 'no-minify');
    })();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = output => {
        cache.set(cacheKey, output);
        return output;
    }

    const {css} = targetedExport;
    await css.outputs.ready;
    const resource = await css.outputs.build(local);

    /**
     * Transform to the requested format if not esm
     */
    const {minify} = specs;
    // TODO: minify css

    const output = specs.map ?
        {content: resource.map, statusCode: 200, contentType: 'text/css'} :
        {content: resource.code, statusCode: 200, contentType: 'text/css'};
    return done(output);
}
