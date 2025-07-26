module.exports = function (plm) {
    this.consumers = new (require('./consumers'))(plm);
    this.packagers = new (require('./packagers'))(plm);
    this.dependencies = new (require('./dependencies'))(plm);

    this.data = async params => plm.data(params, 'bundles/get');
}