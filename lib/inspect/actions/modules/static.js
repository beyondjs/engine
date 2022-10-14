module.exports = function (plm) {
    this.data = async params => plm.data(params, 'modules/static/get');
    this.list = async params => plm.list(params, 'modules/static/list', 'module');
}