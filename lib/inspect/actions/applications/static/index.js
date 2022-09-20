module.exports = function (helpers) {
    this.list = require('./list');
    this.data = async params => helpers.data(params, 'applications/static/get');
}