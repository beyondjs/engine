const cache = new Map();

module.exports = async function (specifier, targetedExport, specs) {
    const cacheKey = (() => `${targetedExport.id}//` + (specs.map ? 'map' : 'code'))();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = output => {
        cache.set(cacheKey, output);
        return output;
    }

    const {types} = targetedExport;
    await types.outputs.ready;
    const resource = await types.outputs.build();

    const output = specs.map ?
        {content: resource.map, statusCode: 200, contentType: 'text/prs.typescript'} :
        {content: resource.code, statusCode: 200, contentType: 'text/prs.typescript'};
    return done(output);
}
