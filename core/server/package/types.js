const cache = new Map();

module.exports = async function (specifier, targetedExport, specs) {
    const cacheKey = (() => `${targetedExport.id}//` + (specs.map ? 'map' : 'code'))();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = response => {
        cache.set(cacheKey, response);
        return response;
    }

    const {types} = targetedExport;
    if (!types) {
        return {
            content: `Subpath "${specifier.subpath}" does not export types`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    await types.outputs.ready;
    const output = await types.outputs.build();
    if (output.diagnostics && !output.diagnostics.valid) {
        return {
            content: `Subpath "${specifier.subpath}" has been processed with errors`,
            statusCode: 500, contentType: 'text/plain'
        };
    }
    if (output.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export types`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    const content = specs.map ? JSON.stringify(output.map) : output.code;
    const response = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'text/prs.typescript'};
    return done(response);
}
