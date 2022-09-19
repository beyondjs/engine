const {Resource} = global;

/**
 * The cordova config.xml resource
 *
 * @param application {object} The application object
 * @returns {Function}
 */
module.exports = application => async function (platform) {
    'use strict';

    if (!['android', 'ios'].includes(platform))
        throw new Error('Platform is invalid or not specified');

    const config = require('./config')(application, platform);

    const resources = [];
    const dirname = require('path').join(__dirname, 'platforms', platform);

    if (platform === 'android') {
        const file = require('path').join(dirname, 'main.html');
        resources.push({
            output: 'www/main.html',
            resource: new Resource({type: 'file', file: file, extname: '.html'})
        });
    }

    const firebase = await require('./firebase.js')(application, platform);
    firebase ? resources.push(firebase) : null;

    const configxml = await require('./config.xml.js')(application, dirname, config, {
        firebase: !!firebase
    });

    resources.push({
        output: 'config.xml',
        resource: new Resource({type: 'content', content: configxml, extname: '.xml'})
    });
    return resources;
}
