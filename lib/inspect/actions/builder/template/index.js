module.exports = function (service) {
    this.update = service.builder.template.update;
    this.delete = service.builder.template.delete;
};