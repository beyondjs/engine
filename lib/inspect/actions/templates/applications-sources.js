module.exports = function (plm) {
    this.data = async params => plm.data(params, 'templates/applications/sources/get');
    this.list = async params => plm.list(params, 'templates/applications/sources/list', 'application');
}