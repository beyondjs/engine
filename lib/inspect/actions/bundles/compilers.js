module.exports = function (plm) {
    this.data = async params => plm.data(params, 'bundles/packagers/compilers/get');
}