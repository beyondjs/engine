const {URL} = require('url');
const {join} = require('path');
const fs = require('beyond/utils/fs');
const respond = require('./respond');
const dependenciesScript = require('./dependencies');

/**
 * The http listener that serves an application
 *
 * @param specs {*} The application specification
 * @param local {{inspect: number}} The local engine specification, actually the inspection port
 * @returns {Function}
 */
module.exports = (specs, local) => async function (request, response) {
    'use strict';

    const url = new URL(request.url, 'void://');

    /**
     * Check if the resource is a file in the path of the application
     */
    const resolved = await (async () => {
        const file = join(specs.path, url.pathname);
        const exists = await fs.exists(file);
        if (!exists) return;

        respond({file}, response);
        return true;
    })();
    if (resolved) return;

    /**
     * Check if the requested resource is the dependencies object
     */
    if (url.pathname === '/dependencies') {
        dependenciesScript(specs, response);
        return;
    }

    /**
     * Resource not found
     */
    const message = `404 - Resource "${url.pathname}" not found`;
    respond({message, statusCode: 404}, response);
}
