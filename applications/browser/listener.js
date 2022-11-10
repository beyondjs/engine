const {URL} = require('url');

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
    response.end(`request pathname: "${url.pathname}"`);
}
