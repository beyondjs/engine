/**
 * Process the index.html resource
 *
 * @param application {object} The application object
 * @param content {string} The index.html data
 * @param distribution {object} The distribution specification
 * @param local {{inspect: number}}
 * @returns {Promise<*>}
 */
module.exports = async function (application, content, distribution, local) {
    'use strict';

    await application.ready;

    // Replace the title
    const title = (application.title) ? application.title : 'Application';
    content = content.replace(/(<!--(\s*)#beyond\.title(\s*)-->)/i, title);

    const head = await require('./head')(application, distribution, local);
    return content.replace(/(<!--(\s*)#beyond\.head(\s*)-->)/i, head);
}
