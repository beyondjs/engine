const minify = require('html-minifier').minify;

module.exports = function (file, content) {
    try {
        const html = minify(content, {'removeComments': true});
        return {html};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }
};
