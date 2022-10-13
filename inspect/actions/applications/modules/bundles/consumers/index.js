module.exports = function (plm) {
    this.list = require('./list');
    this.data = async params => plm.data(params, 'applications/modules/bundles/consumers/get');
}