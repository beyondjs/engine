module.exports = function (helpers) {
    this.launcher = new (require('./launcher'))(helpers);

    this.list = require('./list');
    this.data = async params => helpers.data(params, 'applications/distributions/get');
}