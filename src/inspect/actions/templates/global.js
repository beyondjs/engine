module.exports = function (plm) {
    this.sources = new (require('./global-sources'))(plm);
    this.data = async params => plm.data(params, 'templates/global/get');
}