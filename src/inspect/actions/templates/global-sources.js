module.exports = function (plm) {
    this.data = async params => plm.data(params, 'templates/global/sources/get');
    this.list = async params => plm.list(params, 'templates/global/sources/list', 'application');
}