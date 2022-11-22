const CleanCSS = require('clean-css');

const cache = new Map();

module.exports = async function (specifier, targetedExport, specs) {
    const cacheKey = (() => {
        const {minify, map} = specs;
        return `${targetedExport.id}//` + (map ? 'map//' : 'code//') + (minify ? 'minify' : 'no-minify');
    })();
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const done = response => {
        cache.set(cacheKey, response);
        return response;
    }

    const {css} = targetedExport;
    if (!css) {
        return {
            content: `Subpath "${specifier.subpath}" does not export a stylesheet`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    await css.outputs.ready;
    const output = await css.outputs.build();
    if (!output.diagnostics.valid) {
        return {
            content: `Subpath "${specifier.subpath}" has been processed with errors`,
            statusCode: 500, contentType: 'text/plain'
        };
    }
    if (output.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export a stylesheet`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    const {code, map, errors, warnings} = (() => {
        if (!specs.minify) return {code: output.code, map: output.map};

        const cleaned = (new CleanCSS()).minify(output.code, output.map);
        const {errors, warnings} = cleaned;

        if (errors.length) return {errors, warnings};

        let {styles: code, map} = cleaned;
        return {code, map, warnings};
    })();

    if (errors?.length) {
        let content = `Error minifying stylesheet:\n`;
        errors.forEach(error => (content += `-> ${error}\n`));
        return done({content, statusCode: 500, contentType: 'text/plain'});
    }

    const content = specs.map ? JSON.stringify(map) : code;
    const response = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'text/css'};
    return done(response);
}
