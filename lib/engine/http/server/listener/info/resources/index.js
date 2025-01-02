const {fs} = global.utils;

module.exports = async function (resource) {
    'use strict';

    let file = `/src/${resource}`;

    file = require('path').join(__dirname, 'src', resource);
    const exists = await fs.exists(file);
    return exists ? new global.Resource({file}) : new global.Resource({'404': 'Resource not found'});
}
