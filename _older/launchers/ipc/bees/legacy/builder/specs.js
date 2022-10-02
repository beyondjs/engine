module.exports = function (config) {
    config.legacy.modules = config.legacy.modules ? config.legacy.modules : './modules';

    // Adjust "core" and "sessions" and "modules" properties.
    // If those have been configured as strings,
    // they must be transformed to objects whose path property is the specified string.
    // Also check if the path property is specified, and set the absolute path
    // from the relative configured path.
    const adjust = (property) => {
        let value = config.legacy[property];
        if (!value) {
            delete config.legacy[property];
            return;
        }

        value = typeof value === 'string' ? {path: value} : value;
        if (!value.path) {
            delete config.legacy[property];
            return;
        }

        value.path = require('path').join(config.project.path, value.path);
        config.legacy[property] = value;
    }

    adjust('core');
    adjust('sessions');
    adjust('modules');
}
