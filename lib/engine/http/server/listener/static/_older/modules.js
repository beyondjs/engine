const {Resource} = global;

/**
 * Serves the static files of the modules
 *
 * @param application {object} The application object
 * @param distribution {object} The distribution specification
 * @param parsed {object} The parsed url
 * @param original {boolean} Is the original or the overwritten resource being requested
 * @return {Promise<*>}
 */
module.exports = async function (application, distribution, parsed, original) {
    await application.modules.ready;

    const {platform} = distribution;

    if (!application.modules.resources.platforms.has(`${parsed.id}//${platform}`)) {
        if (application.libraries.has(parsed.package.id)) {
            return new Resource({'404': `Library "${parsed.package.id}" does not have the module "${parsed.name}"`});
        }
        return;
    }

    const module = application.modules.resources.platforms.get(`${parsed.id}//${platform}`);
    await module.ready;
    await module.static.ready;

    // The module.static is a map where the key is the web location (uses the web slash('/') separator)
    if (!(module.static.has(parsed.resource))) {
        return new Resource({'404': `Module "${parsed.id}" does not have a static resource "${parsed.resource}"`});
    }

    const resource = module.static.get(parsed.resource);
    return new Resource({file: resource.overwrite && !original ? resource.overwrite.file : resource.file.file});
}
