module.exports = function (plm) {
    this.data = async params => plm.data(params, 'applications/modules/get');
    this.count = async params => plm.data(params, 'applications/modules/count');
    this.list = params => plm.list(params, 'applications/modules/list', 'application');
}