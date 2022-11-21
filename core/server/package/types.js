const cache = new Map();

module.exports = async function (specifier, targetedExport, specs) {
    const cacheKey = (() => `${targetedExport.id}//` + (specs.map ? 'map' : 'code'))();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = output => {
        cache.set(cacheKey, output);
        return output;
    }

    const {types} = targetedExport;
    if (!types) {
        return {
            content: `Subpath "${specifier.subpath}" does not export types`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    await types.outputs.ready;
    const resource = await types.outputs.build();
    if (resource.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export types`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    const content = specs.map ? JSON.stringify(resource.map) : resource.code;
    const output = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'text/prs.typescript'};
    return done(output);
}
