const cache = new Map();

module.exports = async function (specifier, targetedExport, specs) {
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
    if (!css) {
        return {
            content: `Subpath "${specifier.subpath}" does not export a stylesheet`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    await css.outputs.ready;
    const resource = await css.outputs.build();
    if (resource.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export a stylesheet`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    /**
     * Transform to the requested format if not esm
     */
    const {minify} = specs;
    // TODO: minify css

    const content = specs.map ? JSON.stringify(resource.map) : resource.code;
    const output = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'text/css'};
    return done(output);
}
