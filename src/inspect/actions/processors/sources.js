module.exports = function (plm) {
    this.data = async params => plm.data(params, 'processors/sources/get');
    this.list = async params => plm.list(params, 'processors/sources/list', 'processor');
}