module.exports = function (plm) {
    this.compilers = new (require('./compilers'))(plm);
    this.data = async params => plm.data(params, 'applications/modules/bundles/packagers/get');
}