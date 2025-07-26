module.exports = function (plm) {
    this.data = async params => plm.data(params, 'processors/compilers/get');
}