module.exports = function (plm) {
    this.data = async params => plm.data(params, 'bundles/consumers/get');
    this.list = async params => plm.list(params, 'bundles/consumers/list', 'bundle');
}