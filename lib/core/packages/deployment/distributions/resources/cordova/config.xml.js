const {fs} = global.utils;

/**
 * Process the index.html resource
 *
 * @param application {object} The application object
 * @param dirname {string} The root of the project build
 * @param config {object} The build configuration
 * @param specs {object} Additional specifications
 * @returns {Promise<*>}
 */
module.exports = async function (application, dirname, config, specs) {
    'use strict';

    const file = require('path').join(dirname, 'config.xml');

    let content = await fs.readFile(file, 'UTF8');
    const replace = (parameter, value) =>
        content = content.replace(`#${parameter}#`, value);

    const remove = plugin => {
        let start = (new RegExp(`<!-- ${plugin} plugin`)).exec(content);
        start = start ? start.index : 0;
        let end = (new RegExp(`\/${plugin} plugin --> *`)).exec(content);
        end = end ? end.index + end[0].length : 0;
        content = start && end ?
            content.substr(0, start) +
            `<!-- ${plugin} plugin is disabled -->` + content.substr(end) :
            content;
    };

    replace('application.id', config.id);
    replace('application.name', config.name);
    replace('application.description', config.description);
    replace('author.name', config.author.name);
    replace('author.href', config.author.href);
    replace('author.email', config.author.email);
    replace('version.number', config.version.number);
    replace('version.code', config.version.code);

    if (!config.facebook) {
        remove('Facebook');
    }
    else {
        replace('facebook.id', config.facebook.id);
        replace('facebook.name', config.facebook.name);
    }

    if (!specs.firebase) {
        remove('Firebase analytics');
        remove('Push notifications');
    }

    return content;
}
