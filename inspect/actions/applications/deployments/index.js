module.exports = function (plm) {
    this.distributions = new (require('./distributions'))(plm);

    this.list = require('./list');
    this.data = async params => plm.data(params, 'applications/deployments/get');
};
