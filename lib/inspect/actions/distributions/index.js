module.exports = function (plm) {
    this.launchers = new (require('./launchers'))(plm);

    this.list = require('./list');
    this.data = async params => plm.data(params, 'applications/distributions/get');
}