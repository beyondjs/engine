module.exports = function (service) {
    this.validate = async params => service.dashboard.validate(params);
    this.cleanCache = async params => service.dashboard.cleanCache(params);
    this.getWD = async params => service.dashboard.getWD(params);
};
