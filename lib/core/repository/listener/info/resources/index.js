const fs = void 0; // require('fs').promises;

module.exports = async function (resource) {
    'use strict';

    const file = require('path').join(__dirname, 'src', resource);
    const exists = await fs.exists(file);
    return exists ? new global.Resource({file}) : new global.Resource({'404': 'Resource not found'});
}
