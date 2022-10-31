const {minify} = require('uglify-js');

module.exports = function (file, content) {
    const {code, error} = minify(content);
    return error ? {errors: [error]} : {code};
}
