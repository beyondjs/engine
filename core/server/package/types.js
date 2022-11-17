const cache = new Map();

module.exports = async function (specifier, condition) {
    if (cache.has(condition.id)) return cache.get(condition.id);

    const {types} = condition;

    const done = output => {
        cache.set(condition.id, output);
        return output;
    }

    await types.outputs.ready;
    if (!types.outputs.valid) {
        let content = `Errors found processing "${specifier.specifier}" module types:\n`;
        types.outputs.errors.forEach(error => (content += `-> ${error}\n`));
        return done({content, statusCode: 500, contentType: 'text/plain'});
    }

    const resource = await types.outputs.build();
    if (resource.errors?.length) {
        let content = `Error building "${specifier.specifier}" module types:\n`;
        resource.errors.forEach(error => (content += `-> ${error}\n`));
        return done({content, statusCode: 500, contentType: 'text/plain'});
    }

    const {code} = resource;
    return done({content: code, statusCode: 200, contentType: 'text/prs.typescript'});
}
