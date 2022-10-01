/**
 * Process the index.html resource
 *
 * @param application {object} The application object
 * @param distribution {any} The distribution specification
 * @param local {{inspect: number}}
 * @returns {Promise<*>}
 */
module.exports = async function (application, distribution, local) {
    'use strict';

    // Process application icons for the different platforms
    let head = await require('./icons.js')(application, distribution);

    const {platform} = distribution;
    let baseDir = application.baseDir ? application.baseDir : '';
    baseDir = platform === 'web' ? `/${baseDir}` : '';

    // Include application styles
    await application.template.application.ready;
    application.template.application.value &&
    (head += `<link rel="stylesheet" type="text/css" id="beyond-application-styles" ` +
        `href="${baseDir}styles.css" media="screen" />\n`);

    // Include global styles
    await application.template.global.ready;
    application.template.global.value &&
    (head += `<link rel="stylesheet" type="text/css" id="beyond-global-styles" ` +
        `href="${baseDir}global.css" media="screen" />\n`);

    // Check if favicon exists
    await (async () => {
        await application.static.ready;
        const {favicon, type} = (() => {
            if (application.static.includes('favicon.ico')) return {favicon: 'favicon.ico', type: 'image/ico'};
            if (application.static.includes('favicon.png')) return {favicon: 'favicon.png', type: 'image/png'};
            return {};
        })();
        head += favicon ? `<link rel="shortcut icon" type="${type}" href="${baseDir}${favicon}"/>\n` :
                '<link rel="icon" href="data:;base64,=">\n';
    })();

    ['android', 'ios'].includes(platform) && (head += `<script src="cordova.js"></script>\n\n`);

    // Set amd configuration, add ssr page fetch (when enabled), and load required bundles in amd mode
    head += await require('./main')(baseDir, application, distribution, local);

    // add a tab in all lines to the head code
    head = head.replace(/\n/g, '\n    ');
    return head;
}
