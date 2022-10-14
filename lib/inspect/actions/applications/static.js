module.exports = function (plm) {
    this.data = async params => plm.data(params, 'applications/static/get');
    this.list = params => plm.list(params, 'applications/static/list', 'application');
}