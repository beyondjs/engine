const fileResponse = require('./file');
const contentResponse = require('./content');

module.exports = function (specs, response) {
    if (specs.file) return fileResponse(specs, response);
    if (specs.content) return contentResponse(specs, response);

    throw new Error('Invalid response specification');
}
