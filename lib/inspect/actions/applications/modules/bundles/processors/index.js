module.exports = function (helpers) {
    this.sources = new (require('./sources'))(helpers);
    this.compilers = new (require('./compilers'))(helpers);
    this.overwrites = new (require('./overwrites'))(helpers);
    this.dependencies = new (require('./dependencies'))(helpers);

    this.data = async params => helpers.data(params, 'applications/modules/processors/get');
}