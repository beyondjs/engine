module.exports = function (helpers) {
    this.list = require('./list.js');
    this.bundles = new (require('./bundles'))(helpers);

    this.data = async params => helpers.data(params, 'applications/modules/get');

    this.count = async params => helpers.data(params, 'applications/modules/count');
}