/**
 *
 * @param service
 */
module.exports = function (service) {
    this.edit = service.builder.project.edit;
    this.setDistribution = service.builder.project.setDistribution;
    this.create = service.builder.project.create;
    this.backend = service.builder.project.backend;
    this.checkPort = service.builder.project.checkPort;
    this.checkStatic = service.builder.project.checkStatic;
};
