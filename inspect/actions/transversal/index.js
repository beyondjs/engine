module.exports = function (plm) {
    this.data = async params => plm.data(params, 'transversal/dependencies/get');
}