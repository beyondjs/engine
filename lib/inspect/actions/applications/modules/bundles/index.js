module.exports = function (helpers) {
    this.consumers = new (require('./consumers'))(helpers);
    this.processors = new (require('./processors'))(helpers);
    this.packagers = new (require('./packagers'))(helpers);

    this.data = async params => helpers.data(params, 'applications/modules/bundles/get');
}