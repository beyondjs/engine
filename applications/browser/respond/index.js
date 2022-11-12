const fileResponse = require('./file');

module.exports = function (specs, response) {
    if (specs.file) return fileResponse(specs, response);
}
