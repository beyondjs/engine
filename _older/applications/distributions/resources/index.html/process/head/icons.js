const fs = require('beyond/utils/fs');
const {platforms} = require('beyond/cspecs');

module.exports = async function (application, distribution) {
    'use strict';

    const {platform} = distribution;
    const root = platforms.web.includes(platform) ? '/' : '';

    let output = '';
    const add = async (resource, rel) => {
        // Check if images/logo.png file exists
        const file = require('path').join(application.path, `images/${resource}`);
        if (await fs.exists(file)) {
            rel = rel ? ` rel="${rel}"` : '';
            output += `< href="${root}${resource}"${rel}/>\n`;
        }
    }

    await add('icon-android.png', 'apple-touch-icon');
    await add('icon-ios.png', 'apple-touch-icon');
    await add('favicon.png', 'shortcut icon');

    return output;
}
