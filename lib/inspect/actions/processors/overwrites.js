module.exports = function (plm) {
    this.data = async params => plm.data(params, 'processors/overwrites/get');
    this.list = async params => plm.list(params, 'processors/overwrites/list', 'processor');
}