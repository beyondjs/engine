module.exports = function (plm) {
    this.data = async params => plm.data(params, 'processors/dependencies/get');
    this.list = async params => plm.list(params, 'processors/dependencies/list', 'processor');
}