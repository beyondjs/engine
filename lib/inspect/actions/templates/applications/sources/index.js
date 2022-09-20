module.exports = function (helpers) {
    this.list = require('./list');
    this.data = async params => helpers.data(params, 'templates/applications/sources/get');
}