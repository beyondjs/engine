/**
 * Object that handles file creation or modification
 * @param service
 */
module.exports = function (service) {
    this.module = new (require('./module'))(service);
    this.template = new (require('./template'))(service);
    this.project = new (require('./project'))(service);
};
