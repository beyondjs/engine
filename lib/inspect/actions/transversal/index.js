module.exports = function (plm) {
    this.list = require('./list');
    this.data = async params => plm.data(params, 'transversal/dependencies/get');
}