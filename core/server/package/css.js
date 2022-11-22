const CleanCSS = require('clean-css');

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
    if (!resource.diagnostics.valid) {
        return {
            content: `Subpath "${specifier.subpath}" has been processed with errors`,
            statusCode: 500, contentType: 'text/plain'
        };
    }
    if (resource.code === void 0) {
        return {
            content: `Subpath "${specifier.subpath}" does not export a stylesheet`,
            statusCode: 404, contentType: 'text/plain'
        };
    }

    const {code, map, errors, warnings} = (() => {
        if (!specs.minify) return {code: resource.code, map: resource.map};

        const cleaned = (new CleanCSS()).minify(resource.code, resource.map);
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
    const output = specs.map ?
        {content, statusCode: 200, contentType: 'application/json'} :
        {content, statusCode: 200, contentType: 'text/css'};
    return done(output);
}
