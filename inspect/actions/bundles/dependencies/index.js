module.exports = function (plm) {
    this.data = async params => plm.data(params, 'bundles/dependencies/get');
}