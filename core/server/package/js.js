const mformat = require('beyond/mformat');

const cache = new Map();

module.exports = async function (specifier, targetedExport, local, specs) {
    const cacheKey = (() => {
        const {format, minify, map} = specs;
        return `${targetedExport.id}//` + (map ? 'map' : `${format}/${minify}`);
    })();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = response => {
        cache.set(cacheKey, response);
        return response;
    }

    const {js} = targetedExport;
    if (!js) {
        return {
            content: `Subpath "${specifier.subpath}" does not export javascript code`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    await js.outputs.ready;
    const output = await js.outputs.build(local);
    if (output.diagnostics && !output.diagnostics.valid) {
        return {
            content: `Subpath "${specifier.subpath}" has been processed with errors`,
            statusCode: 500, contentType: 'text/plain'
        };
    }
    if (output.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export javascript code`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    /**
     * Transform to the requested format if not esm
     */
    const {format, minify} = specs;
    if (!mformat.formats.includes(format)) {
        return done({content: `Format "${format}" is not a valid option`, statusCode: 404, contentType: 'text/plain'});
    }

    const {code, map, errors} = mformat({format, minify, code: output.code, map: output.map});
    if (errors?.length) {
        let content = `Error transforming module to "${format}" format:\n`;
        errors.forEach(error => (content += `-> ${error}\n`));
        return done({content, statusCode: 500, contentType: 'text/plain'});
    }

    const content = specs.map ? JSON.stringify(map) : code;
    const response = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'application/javascript'};
    return done(response);
}