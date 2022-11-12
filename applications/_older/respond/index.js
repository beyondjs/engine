module.exports = (response, distribution) => function (resource) {
    'use strict';

    if (resource.type === 'content') {
        require('./200')(response, resource, distribution);
    }
    else if (!resource || resource.type === '404') {
        require('./404')(response, resource);
    }
    else if (resource.type === 'file') {
        require('./file')(response, resource, distribution);
    }
    else if (resource.type === '500') {
        require('./500')(response, resource);
    }
    else {
        throw new Error(`Invalid response specification`);
    }
}
