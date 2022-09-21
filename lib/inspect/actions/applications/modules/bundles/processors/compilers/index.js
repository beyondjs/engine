module.exports = function (plm) {
    this.data = async params => plm.data(params, 'applications/modules/processors/compilers/get');
}