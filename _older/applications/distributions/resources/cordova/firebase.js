const fs = require('beyond/utils/fs');

module.exports = async function (application, platform) {
    'use strict';

    const Resource = global.Resource;

    const resource = platform === 'android' ? 'google-services.json' : 'GoogleService-Info.plist';
    const file = require('path').join(application.path, 'resources', resource);

    return await fs.exists(file) ? {
        output: resource,
        resource: new Resource({type: file, file: file, extname: '.txt'})
    } : void 0;
}
