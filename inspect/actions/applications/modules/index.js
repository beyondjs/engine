module.exports = function (plm) {
    this.list = require('./list.js');
    this.bundles = new (require('./bundles'))(plm);

    this.data = async params => plm.data(params, 'applications/modules/get');

    this.count = async params => plm.data(params, 'applications/modules/count');
}