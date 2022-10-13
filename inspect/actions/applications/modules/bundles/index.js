module.exports = function (plm) {
    this.consumers = new (require('./consumers'))(plm);
    this.processors = new (require('./processors'))(plm);
    this.packagers = new (require('./packagers'))(plm);

    this.data = async params => plm.data(params, 'applications/modules/bundles/get');
}