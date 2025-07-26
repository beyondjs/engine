module.exports = function (plm) {
    this.sources = new (require('./applications-sources'))(plm);
    this.data = async params => plm.data(params, 'templates/applications/get');
}