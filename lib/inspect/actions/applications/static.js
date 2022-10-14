module.exports = function (plm) {
    this.list = params => plm.list(params, 'applications/static/list');
    this.data = async params => plm.data(params, 'applications/static/get');
}