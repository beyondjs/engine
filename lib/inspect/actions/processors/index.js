module.exports = function (plm) {
    this.sources = new (require('./sources'))(plm);
    this.compilers = new (require('./compilers'))(plm);
    this.overwrites = new (require('./overwrites'))(plm);
    this.dependencies = new (require('./dependencies'))(plm);

    this.data = async params => plm.data(params, 'processors/get');
}