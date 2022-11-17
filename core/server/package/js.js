const mformat = require('beyond/mformat');

const cache = new Map();

module.exports = async function (specifier, condition, local, specs) {
    const {js} = condition;

    await js.outputs.ready;
    if (!js.outputs.valid) {
        let content = `Errors found processing "${specifier.specifier}" module:\n`;
        js.outputs.errors.forEach(error => (content += `-> ${error}\n`));
        return {content, statusCode: 500, contentType: 'text/plain'};
    }

    const resource = await js.outputs.build(local);
    if (!resource.valid) {
        let content = `Error building "${specifier.specifier}" module:\n`;
        resource.errors.forEach(error => (content += `-> ${error}\n`));
        return {content, statusCode: 500, contentType: 'text/plain'};
    }

    const key = (() => {
        const {format, minify, map} = specs;
        return `${condition.id}//` + (map ? 'map' : `${format}/${minify}`);
    })();

    if (cache.has(key)) return cache.get(key);

    const done = output => {
        cache.set(key, output);
        return output;
    }

    /**
     * Transform to the requested format if not esm
     */
    const {format, minify} = specs;
    if (!mformat.formats.includes(format)) {
        return done({content: `Format "${format}" is not a valid option`, statusCode: 404, contentType: 'text/plain'});
    }

    const {code, map, errors} = mformat({format, minify, code: resource.code, map: resource.map});
    if (errors?.length) {
        let content = `Error transforming module to "${format}" format:\n`;
        errors.forEach(error => (content += `-> ${error}\n`));
        return done({content, statusCode: 500, contentType: 'text/plain'});
    }

    const output = specs.map ?
        {content: map, statusCode: 200, contentType: 'application/javascript'} :
        {content: code, statusCode: 200, contentType: 'application/javascript'};
    return done(output);
}
