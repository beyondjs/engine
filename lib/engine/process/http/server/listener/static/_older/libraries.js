const {Resource} = global;

/**
 * Serves the static files of the libraries (imported applications)
 *
 * @param application {object} The application object
 * @param parsed {object} The parsed url
 * @param original {boolean} Is the original or the overwritten resource being requested
 * @return {Promise<*>}
 */
module.exports = async function (application, parsed, original) {
    await application.libraries.ready;

    if (!application.libraries.has(parsed.package.id)) {
        return new Resource({
            '404': `Library "${parsed.package.id}" is not registered in the ` +
                `application on path "${application.path}"`
        });
    }

    const library = application.libraries.get(parsed.package.id);
    await library.static.ready;

    // The library.static is a map where the key is the web location (uses the web slash('/') separator)
    if (!(library.static.has(parsed.resource))) {
        return new Resource({'404': `Library "${parsed.package.id}" does not have a static resource "${parsed.resource}"`});
    }

    const resource = library.static.get(parsed.resource);
    return new Resource({file: resource.overwrite && !original ? resource.overwrite.file : resource.file.file});
}
