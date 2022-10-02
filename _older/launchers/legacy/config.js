module.exports = class extends require('../base') {
    constructor(path, config) {
        config = {
            core: config.core,
            sessions: config.sessions,
            modules: config.modules ? config.modules : './modules'
        };

        // Adjust "core" and "sessions" and "modules" properties.
        // If those have been configured as strings,
        // they must be transformed to objects whose path property is the specified string.
        // Also check if the path property is specified, and set the absolute path
        // from the relative configured path.
        const adjust = (property) => {
            let value = config[property];
            if (!value) {
                delete config[property];
                return;
            }

            value = typeof value === 'string' ? {path: value} : value;
            if (!value.path) {
                delete config[property];
                return;
            }

            value.path = require('path').join(path, value.path);
            config[property] = value;
        };

        adjust('core');
        adjust('sessions');
        adjust('modules');

        super(path, {config});
    }
}
