/**
 * Search the bundle of the current resource
 *
 * @param resource {object} The parsed resource data
 * @param distribution {object} The distribution specification
 * @return {Promise<{bundle}|{error}>}
 */
module.exports = async function (resource, distribution) {
    if (!resource || !distribution) throw new Error('Invalid parameters');
    if (resource.error) throw new Error(`Resource is invalid`);

    const {application} = resource;

    if (resource.is === 'transversal') {
        const {transversals} = application;
        return {transversal: transversals.get(resource.bundle)};
    }

    let bundle;

    // Check if the resource being requested is the bundle of a library
    const {libraries} = application;
    if (resource.package !== application.package && !resource.name) {
        if (!libraries.has(resource.id)) {
            const error = `Library "${resource.id}" does not exist`;
            return {error};
        }

        const library = libraries.get(resource.id);
        bundle = library.bundles.has(resource.bundle) ? library.bundles.get(resource.bundle) : void 0;
        if (!bundle) {
            const error = `Library "${resource.id}" does not implement the bundle "${resource.bundle}"`;
            return {error};
        }
        return {bundle};
    }

    await application.modules.ready;
    if (!application.modules.resources.ids.has(resource.id)) {
        const error = `Module "${resource.id}" not found`;
        return {error};
    }

    const {platform} = distribution;
    const resourceKey = `${resource.id}//${platform}`;

    if (!(application.modules.resources.platforms.has(resourceKey))) {
        const error = `Platform "${platform}" is not supported on module "${resource.id}"`;
        return {error};
    }
    const module = application.modules.resources.platforms.get(resourceKey);
    await module.ready;

    await module.bundles.ready;
    if (!module.bundles.has(resource.bundle)) {
        const error = `Module "${module.id}" does not have a "${resource.bundle}" bundle`;
        return {error};
    }
    bundle = module.bundles.get(resource.bundle);

    return {bundle};
}
