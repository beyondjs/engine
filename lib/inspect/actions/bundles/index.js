module.exports = function (plm) {
    this.dependencies = new (require('./dependencies'));

    this.list = require('./list');
    this.data = async params => plm.data(params, 'bundles/get');
}