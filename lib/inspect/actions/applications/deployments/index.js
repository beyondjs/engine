module.exports = function (helpers) {
    this.distributions = new (require('./distributions'))(helpers);

    this.list = require('./list');
    this.data = async params => helpers.data(params, 'applications/deployments/get');
};
