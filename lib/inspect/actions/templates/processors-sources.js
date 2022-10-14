module.exports = function (plm) {
    this.data = async params => plm.data(params, 'templates/processors/sources/get');
    this.list = async params => plm.list(params, 'templates/processors/sources/list', 'id');
}