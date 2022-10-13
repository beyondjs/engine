const {Resource} = global;
const {sep} = require('path');

/**
 * Serves the static files of the application
 *
 * @param application {object} The application object
 * @param url {object} The parsed url being served
 * @return {Promise<*>}
 */
module.exports = async function (application, url) {
    const pathname = url.pathname.substr(1);

    // The application.static is a finder object, its key is the relative path of the static files
    // it uses the OS separator ('/' or '\')
    const key = sep === '/' ? pathname : pathname.replace(/\//g, sep);

    await application.static.ready;
    if (!application.static.includes(key)) return;

    const {file} = application.static.find(key);
    return new Resource({file});
}
