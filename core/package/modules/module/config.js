/**
 * Process module configuration
 *
 * @param input {object} The module configuration input
 * @returns {object} The post processed module configuration
 */
module.exports = function (input) {
    'use strict';

    let output;

    // All the configuration properties that are not reserved keys, are plugins
    const reserved = ['platforms', 'engines', 'server', 'static', 'developer', 'name', 'title', 'description'];

    // When the plugin is specified (or the legacy input.bundle), convert it to {plugin: ...}
    input.bundle && (input.plugin = input.bundle);
    if (input.plugin) {
        output = {};
        output[input.plugin] = input;

        // Move the following attributes to the level of the module configuration,
        // as they are not part of the plugin configuration
        reserved.forEach(property => {
            input[property] ? output[property] = input[property] : null;
            delete output[input.plugin][property];
        });

        delete output[input.plugin].plugin;
    }
    else {
        output = input;
    }

    // Move the plugins to the .plugins attribute
    output.plugins = {};
    for (const attribute of Object.keys(output)) {
        if (attribute === 'plugins') continue;
        if (reserved.includes(attribute)) continue;
        output.plugins[attribute] = output[attribute];
        delete output[attribute];
    }

    return output;
}
