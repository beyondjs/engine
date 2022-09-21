module.exports = function (plm) {
    this.data = async params => plm.data(params, 'applications/modules/bundles/packagers/compilers/get');
}