module.exports = function (plm) {
    this.data = params => plm.data(params, 'applications/deployments/get');
    this.list = params => plm.list(params, 'applications/deployments/list', 'application');
}