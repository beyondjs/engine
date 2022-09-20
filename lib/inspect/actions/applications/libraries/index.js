module.exports = function (plm) {
    this.list = require('./list.js');

    this.data = async params => plm.data(params, 'applications/libraries/get');
    this.count = async params => plm.data(params, 'applications/libraries/count');
}