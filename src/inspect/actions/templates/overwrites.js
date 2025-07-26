module.exports = function (plm) {
    this.data = async params => plm.data(params, 'templates/overwrites/get');
    this.list = async params => plm.list(params, 'templates/overwrites/list', 'application');
}