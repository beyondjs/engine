module.exports = function (plm) {
    this.data = async params => plm.data(params, 'applications/distributions/get');
    this.list = async params => plm.list(params, 'applications/distributions/list', 'application');
}